import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Trophy, Clock, XCircle, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GameLeaderboard from '@/components/games/GameLeaderboard';
import PuzzleCountdown from '@/components/games/PuzzleCountdown';
import { getISTDateKey, getISTDateParts } from '@/lib/ist';

// Seeded random for daily puzzles
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// IST date helpers
const getDailySeed = () => {
  const { year, month, day } = getISTDateParts();
  return year * 10000 + month * 100 + day;
};

const getPuzzleNumber = () => {
  const startDate = new Date('2024-01-01T00:00:00+05:30');
  const todayKey = getISTDateKey();
  const currentIST = new Date(`${todayKey}T00:00:00+05:30`);
  const diffTime = currentIST.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// 6x6 Sudoku with 2x3 boxes (numbers 1-6)
const GRID_SIZE = 6;
const BOX_ROWS = 2;
const BOX_COLS = 3;

// Generate a valid 6x6 Sudoku solution using backtracking
const generateSolution = (seed: number): number[][] => {
  const grid: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  
  const isValid = (row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) return false;
    }
    // Check column
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[x][col] === num) return false;
    }
    // Check 2x3 box
    const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS;
    const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS;
    for (let i = 0; i < BOX_ROWS; i++) {
      for (let j = 0; j < BOX_COLS; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  const solve = (seedOffset: number): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === 0) {
          // Shuffle numbers 1-6 based on seed for variety
          const nums = [1, 2, 3, 4, 5, 6];
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom(seed + seedOffset + row * GRID_SIZE + col + i) * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
          }
          
          for (const num of nums) {
            if (isValid(row, col, num)) {
              grid[row][col] = num;
              if (solve(seedOffset + 1)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(0);
  return grid;
};

// Create puzzle by removing numbers
const generatePuzzle = (seed: number) => {
  const solution = generateSolution(seed);
  const puzzle = solution.map(row => [...row]);
  
  // For 6x6, remove 18-22 numbers (keeping 14-18 clues for medium difficulty)
  const positions: [number, number][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      positions.push([i, j]);
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i + 100) * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove 18-22 numbers
  const toRemove = 18 + Math.floor(seededRandom(seed + 200) * 5);
  for (let i = 0; i < toRemove; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = 0;
  }
  
  return { puzzle, solution };
};

const SudokuGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { streak, updateStreak } = useStreak('sudoku');
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

  // Submit score and update streak when complete
  useEffect(() => {
    if (isComplete && !hasSubmitted && user && elapsedTime > 0) {
      submitScore();
      updateStreak();
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
          puzzle_date: getISTDateKey(),
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
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[row][c] === num) newErrors.add(`${row},${c}`);
      }
    }
    
    // Check column
    const colNums = newGrid.map(r => r[col]).filter(n => n !== 0);
    if (colNums.length !== new Set(colNums).size) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][col] === num) newErrors.add(`${r},${col}`);
      }
    }
    
    // Check 2x3 box
    const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS;
    const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS;
    const boxNums: number[] = [];
    for (let r = boxRow; r < boxRow + BOX_ROWS; r++) {
      for (let c = boxCol; c < boxCol + BOX_COLS; c++) {
        if (newGrid[r][c] !== 0) boxNums.push(newGrid[r][c]);
      }
    }
    if (boxNums.length !== new Set(boxNums).size) {
      for (let r = boxRow; r < boxRow + BOX_ROWS; r++) {
        for (let c = boxCol; c < boxCol + BOX_COLS; c++) {
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
                <p className="text-xs text-muted-foreground">Fill with 1-6</p>
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
              <CardContent className="p-3">
                <div 
                  className="grid gap-0.5 mx-auto"
                  style={{ 
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    maxWidth: '300px'
                  }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          aspect-square flex items-center justify-center text-lg sm:text-xl font-bold rounded-sm
                          transition-all
                          ${isOriginal(rowIndex, colIndex) 
                            ? 'bg-muted text-foreground cursor-default' 
                            : 'bg-muted/30 hover:bg-muted/50 cursor-pointer'
                          }
                          ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex ? 'ring-2 ring-primary z-10' : ''}
                          ${hasError(rowIndex, colIndex) ? 'bg-destructive/20 text-destructive' : ''}
                        `}
                        style={{
                          marginRight: colIndex === 2 ? '4px' : undefined,
                          marginBottom: rowIndex === 1 || rowIndex === 3 ? '4px' : undefined,
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
            <div className="grid grid-cols-7 gap-2 mb-4 max-w-[300px] mx-auto">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <Button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  variant="outline"
                  className="aspect-square text-lg font-bold"
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
              className="w-full mb-4"
            >
              See Results
            </Button>

            <PuzzleCountdown />
          </>
        )}
      </main>
    </div>
  );
};

export default SudokuGame;
