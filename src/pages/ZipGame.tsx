import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Undo2, RotateCcw, Trophy, Clock, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GameLeaderboard from '@/components/games/GameLeaderboard';

// Seeded random for daily puzzles
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Get current date in IST (UTC+5:30)
const getISTDate = () => {
  const now = new Date();
  // IST is UTC+5:30, so add 5.5 hours in milliseconds
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return {
    year: istTime.getUTCFullYear(),
    month: istTime.getUTCMonth() + 1,
    day: istTime.getUTCDate(),
  };
};

const getDailySeed = () => {
  const { year, month, day } = getISTDate();
  return year * 10000 + month * 100 + day;
};

const getPuzzleNumber = () => {
  const startDate = new Date('2024-01-01T00:00:00+05:30');
  const { year, month, day } = getISTDate();
  const currentIST = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+05:30`);
  const diffTime = currentIST.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// Generate a solvable Zip puzzle
const generatePuzzle = (seed: number, size: number = 5) => {
  const totalCells = size * size;
  const path: { row: number; col: number }[] = [];
  const visited = new Set<string>();
  
  // Start from a random position
  let startRow = Math.floor(seededRandom(seed) * size);
  let startCol = Math.floor(seededRandom(seed + 1) * size);
  
  path.push({ row: startRow, col: startCol });
  visited.add(`${startRow},${startCol}`);
  
  // Generate a random hamiltonian-like path
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  
  let attempts = 0;
  while (path.length < totalCells && attempts < 10000) {
    const current = path[path.length - 1];
    const validMoves: { row: number; col: number }[] = [];
    
    for (const [dr, dc] of directions) {
      const newRow = current.row + dr;
      const newCol = current.col + dc;
      if (
        newRow >= 0 && newRow < size &&
        newCol >= 0 && newCol < size &&
        !visited.has(`${newRow},${newCol}`)
      ) {
        validMoves.push({ row: newRow, col: newCol });
      }
    }
    
    if (validMoves.length > 0) {
      const randomIndex = Math.floor(seededRandom(seed + path.length + attempts) * validMoves.length);
      const next = validMoves[randomIndex];
      path.push(next);
      visited.add(`${next.row},${next.col}`);
    } else {
      // Backtrack
      if (path.length > 1) {
        const removed = path.pop()!;
        visited.delete(`${removed.row},${removed.col}`);
      }
    }
    attempts++;
  }
  
  // If we couldn't fill all cells, use a simpler pattern
  if (path.length < totalCells) {
    path.length = 0;
    visited.clear();
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const col = i % 2 === 0 ? j : size - 1 - j;
        path.push({ row: i, col });
      }
    }
  }
  
  // Create numbered dots - first and last always shown, plus a few in between
  const dots: { row: number; col: number; num: number }[] = [];
  const numDots = Math.min(6, Math.floor(totalCells / 4) + 2);
  const step = Math.floor(path.length / (numDots - 1));
  
  for (let i = 0; i < numDots; i++) {
    const pathIndex = Math.min(i * step, path.length - 1);
    dots.push({
      ...path[pathIndex],
      num: i + 1
    });
  }
  
  return { path, dots, size };
};

type Cell = {
  row: number;
  col: number;
};

const ZipGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { streak, updateStreak } = useStreak('zip');
  const seed = getDailySeed();
  const puzzleNum = getPuzzleNumber();
  
  const [puzzle] = useState(() => generatePuzzle(seed));
  const [userPath, setUserPath] = useState<Cell[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [previousTime, setPreviousTime] = useState<number | null>(null);

  // Check if user already completed today's puzzle
  useEffect(() => {
    const checkExistingScore = async () => {
      if (!user) return;
      
      const todayDate = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('game_scores')
        .select('time_seconds')
        .eq('user_id', user.id)
        .eq('game_type', 'zip')
        .eq('puzzle_date', todayDate)
        .maybeSingle();
      
      if (data) {
        setAlreadyCompleted(true);
        setPreviousTime(data.time_seconds);
        setShowLeaderboard(true);
      }
    };
    
    checkExistingScore();
  }, [user]);

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

  // Check if puzzle is complete
  useEffect(() => {
    if (userPath.length === puzzle.size * puzzle.size) {
      // Verify the path goes through all dots in order
      let valid = true;
      for (const dot of puzzle.dots) {
        const pathIndex = userPath.findIndex(
          (c) => c.row === dot.row && c.col === dot.col
        );
        const expectedIndex = Math.floor((dot.num - 1) * (userPath.length - 1) / (puzzle.dots.length - 1));
        // Allow some flexibility in position
        if (pathIndex === -1 || Math.abs(pathIndex - expectedIndex) > userPath.length / puzzle.dots.length) {
          valid = false;
          break;
        }
      }
      
      if (valid) {
        setIsComplete(true);
      }
    }
  }, [userPath, puzzle]);

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
          game_type: 'zip',
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

  const getCellKey = (cell: Cell) => `${cell.row},${cell.col}`;

  const isAdjacent = (cell1: Cell, cell2: Cell) => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const handleCellInteraction = useCallback((row: number, col: number) => {
    const cell = { row, col };
    
    if (userPath.length === 0) {
      // Must start from dot 1
      const dot1 = puzzle.dots.find(d => d.num === 1);
      if (dot1 && dot1.row === row && dot1.col === col) {
        setUserPath([cell]);
        if (!startTime) setStartTime(Date.now());
      }
      return;
    }
    
    const lastCell = userPath[userPath.length - 1];
    const cellKey = getCellKey(cell);
    const isInPath = userPath.some(c => getCellKey(c) === cellKey);
    
    if (isAdjacent(lastCell, cell) && !isInPath) {
      setUserPath([...userPath, cell]);
    }
  }, [userPath, puzzle.dots, startTime]);

  const handleMouseDown = (row: number, col: number) => {
    if (isComplete) return;
    setIsDrawing(true);
    handleCellInteraction(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing && !isComplete) {
      handleCellInteraction(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDrawing || isComplete) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const cellData = element.getAttribute('data-cell');
      if (cellData) {
        const [row, col] = cellData.split(',').map(Number);
        handleCellInteraction(row, col);
      }
    }
  }, [isDrawing, isComplete, handleCellInteraction]);

  const handleUndo = () => {
    if (userPath.length > 1) {
      setUserPath(userPath.slice(0, -1));
    } else {
      setUserPath([]);
    }
  };

  const handleReset = () => {
    setUserPath([]);
    setIsComplete(false);
    setStartTime(null);
    setElapsedTime(0);
    setHasSubmitted(false);
  };

  const getDotNumber = (row: number, col: number) => {
    const dot = puzzle.dots.find(d => d.row === row && d.col === col);
    return dot?.num;
  };

  const getPathIndex = (row: number, col: number) => {
    return userPath.findIndex(c => c.row === row && c.col === col);
  };

  const getCellColor = (row: number, col: number) => {
    const pathIndex = getPathIndex(row, col);
    if (pathIndex === -1) return '';
    
    const progress = pathIndex / Math.max(userPath.length - 1, 1);
    // Gradient from orange to pink
    if (progress < 0.33) return 'bg-orange-500';
    if (progress < 0.66) return 'bg-red-500';
    return 'bg-pink-500';
  };

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
          <GameLeaderboard gameType="zip" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
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
                <h1 className="text-lg font-semibold">Zip #{puzzleNum}</h1>
                <p className="text-xs text-muted-foreground">Connect dots in order</p>
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
          <Card className="glass-card border-border/30 mb-6 animate-scale-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 animate-bounce">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">You're crushing it!</CardTitle>
              <p className="text-muted-foreground">Zip #{puzzleNum}</p>
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
                <div 
                  className="grid gap-1 mx-auto select-none touch-none"
                  style={{ 
                    gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                    maxWidth: '320px',
                    aspectRatio: '1'
                  }}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  {Array.from({ length: puzzle.size }).map((_, row) =>
                    Array.from({ length: puzzle.size }).map((_, col) => {
                      const dotNum = getDotNumber(row, col);
                      const pathIndex = getPathIndex(row, col);
                      const isInPath = pathIndex !== -1;
                      const cellColor = getCellColor(row, col);
                      
                      return (
                        <div
                          key={`${row}-${col}`}
                          data-cell={`${row},${col}`}
                          className={`
                            relative flex items-center justify-center rounded-lg cursor-pointer
                            transition-all duration-150
                            ${isInPath ? cellColor : 'bg-muted/50 hover:bg-muted'}
                            ${dotNum ? 'ring-2 ring-white/50' : ''}
                          `}
                          onMouseDown={() => handleMouseDown(row, col)}
                          onMouseEnter={() => handleMouseEnter(row, col)}
                          onTouchStart={() => handleMouseDown(row, col)}
                        >
                          {dotNum && (
                            <div className="absolute w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold shadow-md z-10">
                              {dotNum}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 mb-6">
              <Button onClick={handleUndo} variant="outline" className="flex-1" disabled={userPath.length === 0}>
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="text-sm">How to play</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-8 text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {n}
                      </div>
                    ))}
                  </div>
                  <span>Connect dots in order</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg" />
                  <span>Fill every cell</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => setShowLeaderboard(true)} 
              variant="outline" 
              className="w-full mt-4"
            >
              See Results
            </Button>
          </>
        )}
      </main>
    </div>
  );
};

export default ZipGame;
