import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Undo2, RotateCcw, Trophy, Clock, Crown, X, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GameLeaderboard from '@/components/games/GameLeaderboard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

// Color palette for regions
const REGION_COLORS = [
  'bg-blue-500/70',
  'bg-purple-500/70',
  'bg-green-500/70',
  'bg-yellow-500/70',
  'bg-red-500/70',
  'bg-pink-500/70',
  'bg-orange-500/70',
  'bg-teal-500/70',
];

type CellState = 'empty' | 'x' | 'queen';

interface Puzzle {
  size: number;
  regions: number[][]; // region ID for each cell
  solution: boolean[][]; // true = queen position
}

// Generate a valid Queens puzzle
const generatePuzzle = (seed: number, size: number = 8): Puzzle => {
  // Generate region layout - each region is a connected group of cells
  const regions: number[][] = Array.from({ length: size }, () => 
    Array(size).fill(-1)
  );
  
  // Simple region generation using a spiral-like pattern with randomness
  let regionId = 0;
  const cellsPerRegion = Math.floor((size * size) / size);
  
  // Create regions by flood-fill approach
  const unassigned: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      unassigned.push([r, c]);
    }
  }
  
  // Shuffle unassigned cells
  for (let i = unassigned.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
  }
  
  // Assign cells to regions, trying to keep regions contiguous
  for (let reg = 0; reg < size; reg++) {
    let cellsAssigned = 0;
    const targetCells = Math.floor((size * size) / size);
    
    // Find a starting cell for this region
    for (let i = 0; i < unassigned.length && cellsAssigned < targetCells; i++) {
      const [r, c] = unassigned[i];
      if (regions[r][c] === -1) {
        // Check if adjacent to same region or first cell of region
        const hasNeighbor = cellsAssigned === 0 || 
          [[0,1],[0,-1],[1,0],[-1,0]].some(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            return nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === reg;
          });
        
        if (hasNeighbor) {
          regions[r][c] = reg;
          cellsAssigned++;
          unassigned.splice(i, 1);
          i--; // Re-check from same index
        }
      }
    }
  }
  
  // Fill any remaining unassigned cells
  for (const [r, c] of unassigned) {
    if (regions[r][c] === -1) {
      // Assign to nearest region
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] !== -1) {
          regions[r][c] = regions[nr][nc];
          break;
        }
      }
      if (regions[r][c] === -1) {
        regions[r][c] = 0; // Fallback
      }
    }
  }
  
  // Generate solution - place queens such that:
  // - One per row, column, and region
  // - No two queens touch (even diagonally)
  const solution: boolean[][] = Array.from({ length: size }, () => 
    Array(size).fill(false)
  );
  
  const isValid = (row: number, col: number, placed: [number, number][]): boolean => {
    // Check column
    if (placed.some(([r, c]) => c === col)) return false;
    
    // Check region
    const region = regions[row][col];
    if (placed.some(([r, c]) => regions[r][c] === region)) return false;
    
    // Check touching (including diagonals)
    for (const [pr, pc] of placed) {
      if (Math.abs(pr - row) <= 1 && Math.abs(pc - col) <= 1) {
        return false;
      }
    }
    
    return true;
  };
  
  const solve = (row: number, placed: [number, number][]): boolean => {
    if (row >= size) return placed.length === size;
    
    // Shuffle column order for variety
    const cols = Array.from({ length: size }, (_, i) => i);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + row * 100 + i) * (i + 1));
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }
    
    for (const col of cols) {
      if (isValid(row, col, placed)) {
        placed.push([row, col]);
        if (solve(row + 1, placed)) {
          return true;
        }
        placed.pop();
      }
    }
    
    return false;
  };
  
  const placed: [number, number][] = [];
  solve(0, placed);
  
  for (const [r, c] of placed) {
    solution[r][c] = true;
  }
  
  return { size, regions, solution };
};

const QueensGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const seed = getDailySeed();
  const puzzleNum = getPuzzleNumber();
  
  const [puzzle] = useState(() => generatePuzzle(seed));
  const [board, setBoard] = useState<CellState[][]>(() => 
    Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill('empty'))
  );
  const [history, setHistory] = useState<CellState[][][]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [previousTime, setPreviousTime] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  // Check if user already completed today's puzzle
  useEffect(() => {
    const checkExistingScore = async () => {
      if (!user) return;
      
      const todayDate = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('game_scores')
        .select('time_seconds')
        .eq('user_id', user.id)
        .eq('game_type', 'queens')
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

  // Check for conflicts and completion
  useEffect(() => {
    const newConflicts = new Set<string>();
    const queens: [number, number][] = [];
    
    // Find all queens
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (board[r][c] === 'queen') {
          queens.push([r, c]);
        }
      }
    }
    
    // Check for conflicts
    for (let i = 0; i < queens.length; i++) {
      const [r1, c1] = queens[i];
      for (let j = i + 1; j < queens.length; j++) {
        const [r2, c2] = queens[j];
        
        // Same row
        if (r1 === r2) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
        
        // Same column
        if (c1 === c2) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
        
        // Same region
        if (puzzle.regions[r1][c1] === puzzle.regions[r2][c2]) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
        
        // Touching (including diagonal)
        if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
      }
    }
    
    setConflicts(newConflicts);
    
    // Check completion - exactly one queen per row, column, and region, no conflicts
    if (queens.length === puzzle.size && newConflicts.size === 0) {
      const rows = new Set(queens.map(([r, _]) => r));
      const cols = new Set(queens.map(([_, c]) => c));
      const regs = new Set(queens.map(([r, c]) => puzzle.regions[r][c]));
      
      if (rows.size === puzzle.size && cols.size === puzzle.size && regs.size === puzzle.size) {
        setIsComplete(true);
      }
    }
  }, [board, puzzle]);

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
          game_type: 'queens',
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

  const handleCellClick = useCallback((row: number, col: number) => {
    if (isComplete) return;
    
    if (!startTime) setStartTime(Date.now());
    
    // Save history for undo
    setHistory(prev => [...prev, board.map(r => [...r])]);
    
    // Cycle through states: empty -> x -> queen -> empty
    const newBoard = board.map(r => [...r]);
    const current = newBoard[row][col];
    
    if (current === 'empty') {
      newBoard[row][col] = 'x';
    } else if (current === 'x') {
      newBoard[row][col] = 'queen';
    } else {
      newBoard[row][col] = 'empty';
    }
    
    setBoard(newBoard);
  }, [board, isComplete, startTime]);

  const handleUndo = () => {
    if (history.length > 0) {
      const previousBoard = history[history.length - 1];
      setBoard(previousBoard);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setBoard(Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill('empty')));
    setHistory([]);
    setIsComplete(false);
    setStartTime(null);
    setElapsedTime(0);
    setHasSubmitted(false);
    setConflicts(new Set());
  };

  const handleHint = () => {
    // Find a cell where a queen should be placed and mark all cells in its row/column/region as X
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (puzzle.solution[r][c] && board[r][c] !== 'queen') {
          toast({
            title: 'Hint',
            description: `Try placing a queen in row ${r + 1}, column ${c + 1}`,
          });
          return;
        }
      }
    }
  };

  const getRegionColor = (regionId: number) => {
    return REGION_COLORS[regionId % REGION_COLORS.length];
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
          {alreadyCompleted && previousTime && (
            <Card className="glass-card border-border/30 mb-6">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-2">You already completed today's puzzle!</p>
                <p className="text-2xl font-bold text-primary">{formatTime(previousTime)}</p>
              </CardContent>
            </Card>
          )}
          <GameLeaderboard gameType="queens" />
        </main>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full glass">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-4">
              <Link to="/games">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Queens #{puzzleNum}</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="glass-card border-border/30 mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Already Completed!</CardTitle>
              <p className="text-muted-foreground">You've solved today's puzzle</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{formatTime(previousTime || 0)}</p>
              </div>
              <Button onClick={() => setShowLeaderboard(true)} className="w-full gradient-purple">
                <Trophy className="w-4 h-4 mr-2" />
                See Results
              </Button>
            </CardContent>
          </Card>
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
                <h1 className="text-lg font-semibold">Queens #{puzzleNum}</h1>
                <p className="text-xs text-muted-foreground">Place one queen per row, column, region</p>
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
                <div className="p-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Brilliant!</CardTitle>
              <p className="text-muted-foreground">Queens #{puzzleNum}</p>
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
                  className="grid gap-0.5 mx-auto select-none"
                  style={{ 
                    gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                    maxWidth: '360px',
                    aspectRatio: '1'
                  }}
                >
                  {Array.from({ length: puzzle.size }).map((_, row) =>
                    Array.from({ length: puzzle.size }).map((_, col) => {
                      const cellState = board[row][col];
                      const regionColor = getRegionColor(puzzle.regions[row][col]);
                      const hasConflict = conflicts.has(`${row},${col}`);
                      
                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`
                            relative flex items-center justify-center cursor-pointer
                            transition-all duration-150 aspect-square
                            ${regionColor}
                            ${hasConflict ? 'ring-2 ring-red-500 ring-inset' : ''}
                            hover:brightness-110
                          `}
                          onClick={() => handleCellClick(row, col)}
                        >
                          {cellState === 'x' && (
                            <X className="w-4 h-4 text-muted-foreground/70" />
                          )}
                          {cellState === 'queen' && (
                            <Crown className={`w-5 h-5 ${hasConflict ? 'text-red-500' : 'text-yellow-400'} fill-current`} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 mb-6">
              <Button onClick={handleUndo} variant="outline" className="flex-1" disabled={history.length === 0}>
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button onClick={handleHint} variant="outline" className="flex-1">
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint
              </Button>
            </div>

            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="how-to-play" className="glass-card border-border/30 rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold">How to play</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    1. Your goal is to have <strong>exactly one</strong> <Crown className="inline w-4 h-4 text-yellow-400 fill-current" /> in each <strong>row, column, and color region</strong>.
                  </p>
                  <p>
                    2. Tap once to place X and tap twice for <Crown className="inline w-4 h-4 text-yellow-400 fill-current" />. Use X to mark where <Crown className="inline w-4 h-4 text-yellow-400 fill-current" /> cannot be placed.
                  </p>
                  <p>
                    3. Two <Crown className="inline w-4 h-4 text-yellow-400 fill-current" /> cannot touch each other, not even diagonally.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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

export default QueensGame;
