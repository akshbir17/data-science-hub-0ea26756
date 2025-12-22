import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GameLeaderboard from '@/components/games/GameLeaderboard';

// Seeded random for daily puzzles
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const getDailySeed = () => {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
};

const getPuzzleNumber = () => {
  const startDate = new Date('2024-01-01');
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// Generate a valid 4x4 Sudoku solution
const generateSolution = (seed: number): number[][] => {
  const solution: number[][] = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
  ];
  
  // Shuffle rows within each 2-row block
  for (let block = 0; block < 2; block++) {
    if (seededRandom(seed + block) > 0.5) {
      const row1 = block * 2;
      const row2 = block * 2 + 1;
      [solution[row1], solution[row2]] = [solution[row2], solution[row1]];
    }
  }
  
  // Shuffle columns within each 2-column block
  for (let block = 0; block < 2; block++) {
    if (seededRandom(seed + block + 10) > 0.5) {
      const col1 = block * 2;
      const col2 = block * 2 + 1;
      for (let row = 0; row < 4; row++) {
        [solution[row][col1], solution[row][col2]] = [solution[row][col2], solution[row][col1]];
      }
    }
  }
  
  // Shuffle numbers (1-4)
  const numMap = [1, 2, 3, 4];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i + 20) * (i + 1));
    [numMap[i], numMap[j]] = [numMap[j], numMap[i]];
  }
  
  return solution.map(row => row.map(cell => numMap[cell - 1]));
};

// Create puzzle by removing numbers
const generatePuzzle = (seed: number) => {
  const solution = generateSolution(seed);
  const puzzle = solution.map(row => [...row]);
  
  // Remove 8-10 numbers (keeping 6-8 clues)
  const positions: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      positions.push([i, j]);
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i + 100) * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove 8-10 numbers
  const toRemove = 8 + Math.floor(seededRandom(seed + 200) * 3);
  for (let i = 0; i < toRemove; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = 0;
  }
  
  return { puzzle, solution };
};

const SudokuGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const seed = getDailySeed();
  const puzzleNum = getPuzzleNumber();
  
  const [{ puzzle, solution }] = useState(() => generatePuzzle(seed));
  const [grid, setGrid] = useState<number[][]>(() => puzzle.map(row => [...row]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Check for completion
  useEffect(() => {
    const isFilled = grid.every(row => row.every(cell => cell !== 0));
    if (isFilled) {
      const isCorrect = grid.every((row, i) => 
        row.every((cell, j) => cell === solution[i][j])
      );
      if (isCorrect) {
        setIsComplete(true);
      }
    }
  }, [grid, solution]);

  // Submit score when complete
  useEffect(() => {
    if (isComplete && !hasSubmitted && user && elapsedTime > 0) {
      submitScore();
    }
  }, [isComplete, hasSubmitted, user, elapsedTime]);

  const submitScore = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'sudoku',
          puzzle_date: new Date().toISOString().split('T')[0],
          time_seconds: elapsedTime,
        }, {
          onConflict: 'user_id,game_type,puzzle_date'
        });
      
      if (error) throw error;
      setHasSubmitted(true);
      toast({
        title: 'Score Saved!',
        description: `Your time: ${formatTime(elapsedTime)}`,
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (row: number, col: number) => {
    if (puzzle[row][col] !== 0 || isComplete) return;
    setSelectedCell([row, col]);
    if (!startTime) setStartTime(Date.now());
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isComplete) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);
    
    // Check for errors
    const newErrors = new Set<string>();
    
    // Check row
    const rowNums = newGrid[row].filter(n => n !== 0);
    if (rowNums.length !== new Set(rowNums).size) {
      for (let c = 0; c < 4; c++) {
        if (newGrid[row][c] === num) newErrors.add(`${row},${c}`);
      }
    }
    
    // Check column
    const colNums = newGrid.map(r => r[col]).filter(n => n !== 0);
    if (colNums.length !== new Set(colNums).size) {
      for (let r = 0; r < 4; r++) {
        if (newGrid[r][col] === num) newErrors.add(`${r},${col}`);
      }
    }
    
    // Check 2x2 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 2) * 2;
    const boxNums: number[] = [];
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 2; c++) {
        if (newGrid[r][c] !== 0) boxNums.push(newGrid[r][c]);
      }
    }
    if (boxNums.length !== new Set(boxNums).size) {
      for (let r = boxRow; r < boxRow + 2; r++) {
        for (let c = boxCol; c < boxCol + 2; c++) {
          if (newGrid[r][c] === num) newErrors.add(`${r},${c}`);
        }
      }
    }
    
    setErrors(newErrors);
  };

  const handleClear = () => {
    if (!selectedCell || isComplete) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = 0;
    setGrid(newGrid);
    setErrors(new Set());
  };

  const handleReset = () => {
    setGrid(puzzle.map(row => [...row]));
    setSelectedCell(null);
    setIsComplete(false);
    setStartTime(null);
    setElapsedTime(0);
    setHasSubmitted(false);
    setErrors(new Set());
  };

  const isOriginal = (row: number, col: number) => puzzle[row][col] !== 0;
  const isCellSelected = (row: number, col: number) => selectedCell?.[0] === row && selectedCell?.[1] === col;
  const hasError = (row: number, col: number) => errors.has(`${row},${col}`);

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full glass">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowLeaderboard(false)}>
                <ArrowLeft className="w-4 h-4" />
                Back to Game
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <GameLeaderboard gameType="sudoku" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full glass">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/games">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Mini Sudoku #{puzzleNum}</h1>
                <p className="text-xs text-muted-foreground">Fill with 1-4</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {isComplete ? (
          <Card className="glass-card border-border/30 mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Puzzle Complete!</CardTitle>
              <p className="text-muted-foreground">Mini Sudoku #{puzzleNum}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{formatTime(elapsedTime)}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button onClick={() => setShowLeaderboard(true)} className="flex-1 gradient-purple">
                  <Trophy className="w-4 h-4 mr-2" />
                  See Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="glass-card border-border/30 mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-1 mx-auto max-w-[280px]">
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          aspect-square flex items-center justify-center text-2xl font-bold rounded-lg
                          transition-all
                          ${isOriginal(rowIndex, colIndex) 
                            ? 'bg-muted text-foreground cursor-default' 
                            : 'bg-muted/30 hover:bg-muted/50 cursor-pointer'
                          }
                          ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex ? 'ring-2 ring-primary' : ''}
                          ${hasError(rowIndex, colIndex) ? 'bg-destructive/20 text-destructive' : ''}
                          ${colIndex === 1 ? 'mr-1' : ''}
                          ${rowIndex === 1 ? 'mb-1' : ''}
                        `}
                        style={{
                          borderRight: colIndex === 1 ? '2px solid hsl(var(--border))' : undefined,
                          borderBottom: rowIndex === 1 ? '2px solid hsl(var(--border))' : undefined,
                        }}
                      >
                        {cell !== 0 ? cell : ''}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Number buttons */}
            <div className="grid grid-cols-5 gap-2 mb-4 max-w-[280px] mx-auto">
              {[1, 2, 3, 4].map(num => (
                <Button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  variant="outline"
                  className="aspect-square text-xl font-bold"
                  disabled={!selectedCell}
                >
                  {num}
                </Button>
              ))}
              <Button
                onClick={handleClear}
                variant="outline"
                className="aspect-square"
                disabled={!selectedCell}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full mb-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            <Button 
              onClick={() => setShowLeaderboard(true)} 
              variant="outline" 
              className="w-full"
            >
              See Results
            </Button>
          </>
        )}
      </main>
    </div>
  );
};

export default SudokuGame;
