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
  solution: [number, number][]; // queen positions
}

// Generate a valid Queens puzzle - solution first, then regions
const generatePuzzle = (seed: number, size: number = 8): Puzzle => {
  // Step 1: Generate a valid queen placement first (N-Queens with no touching)
  const solution: [number, number][] = [];
  
  const isValidQueen = (row: number, col: number): boolean => {
    for (const [qr, qc] of solution) {
      // Same column
      if (qc === col) return false;
      // Touching (including diagonal)
      if (Math.abs(qr - row) <= 1 && Math.abs(qc - col) <= 1) return false;
    }
    return true;
  };
  
  const placeQueens = (row: number): boolean => {
    if (row >= size) return solution.length === size;
    
    // Create shuffled column order for variety
    const cols = Array.from({ length: size }, (_, i) => i);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + row * 100 + i) * (i + 1));
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }
    
    for (const col of cols) {
      if (isValidQueen(row, col)) {
        solution.push([row, col]);
        if (placeQueens(row + 1)) return true;
        solution.pop();
      }
    }
    return false;
  };
  
  placeQueens(0);
  
  // Step 2: Create regions around the queens
  // Each queen gets its own region, grown outward
  const regions: number[][] = Array.from({ length: size }, () => 
    Array(size).fill(-1)
  );
  
  // Start each region with its queen
  for (let i = 0; i < solution.length; i++) {
    const [r, c] = solution[i];
    regions[r][c] = i;
  }
  
  // Grow regions using BFS
  const cellsPerRegion = Math.floor((size * size) / size);
  const regionSizes = Array(size).fill(1);
  const queue: [number, number, number][] = []; // [row, col, regionId]
  
  // Initialize queue with neighbors of queens
  for (let i = 0; i < solution.length; i++) {
    const [r, c] = solution[i];
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
        queue.push([nr, nc, i]);
      }
    }
  }
  
  // Shuffle queue for randomness
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i + 1000) * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  
  // Process queue - assign cells to regions
  let queueIndex = 0;
  while (queueIndex < queue.length) {
    const [r, c, regionId] = queue[queueIndex++];
    
    if (regions[r][c] !== -1) continue;
    if (regionSizes[regionId] >= cellsPerRegion + 1) continue;
    
    regions[r][c] = regionId;
    regionSizes[regionId]++;
    
    // Add neighbors to queue
    const neighbors: [number, number, number][] = [];
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
        neighbors.push([nr, nc, regionId]);
      }
    }
    // Shuffle neighbors before adding
    for (let i = neighbors.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + queueIndex + i) * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }
    queue.push(...neighbors);
  }
  
  // Fill any remaining unassigned cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (regions[r][c] === -1) {
        // Find nearest assigned neighbor
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] !== -1) {
            regions[r][c] = regions[nr][nc];
            break;
          }
        }
        if (regions[r][c] === -1) {
          // Find the smallest region and assign to it
          const minRegion = regionSizes.indexOf(Math.min(...regionSizes));
          regions[r][c] = minRegion;
          regionSizes[minRegion]++;
        }
      }
    }
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
  const [hintIndex, setHintIndex] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [lastHintCell, setLastHintCell] = useState<[number, number] | null>(null);

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

  // Hint cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hintCooldown > 0) {
      interval = setInterval(() => {
        setHintCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hintCooldown]);

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
      const rows = new Set(queens.map(([r]) => r));
      const cols = new Set(queens.map(([, c]) => c));
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
    
    // Clear hint highlight when user clicks
    setLastHintCell(null);
    
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
      setLastHintCell(null);
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
    setHintIndex(0);
    setHintCooldown(0);
    setLastHintCell(null);
  };

  const handleHint = () => {
    if (hintCooldown > 0) return;
    
    if (!startTime) setStartTime(Date.now());
    
    // Find next queen position that isn't already placed correctly
    const unplacedQueens: [number, number][] = [];
    
    for (const [r, c] of puzzle.solution) {
      if (board[r][c] !== 'queen') {
        unplacedQueens.push([r, c]);
      }
    }
    
    if (unplacedQueens.length === 0) {
      toast({
        title: 'All queens placed!',
        description: 'Check for any conflicts.',
      });
      return;
    }
    
    // Get the next hint (cycle through unplaced queens)
    const nextHint = unplacedQueens[hintIndex % unplacedQueens.length];
    const [hintRow, hintCol] = nextHint;
    
    // Highlight the hint cell
    setLastHintCell(nextHint);
    
    // Show toast with hint
    toast({
      title: `Hint ${hintIndex + 1}`,
      description: `A queen belongs in row ${hintRow + 1}, column ${hintCol + 1}`,
    });
    
    // Move to next hint for next time
    setHintIndex(prev => prev + 1);
    
    // Start 10 second cooldown
    setHintCooldown(10);
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
                      const isHintCell = lastHintCell && lastHintCell[0] === row && lastHintCell[1] === col;
                      
                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`
                            relative flex items-center justify-center cursor-pointer
                            transition-all duration-150 aspect-square
                            ${regionColor}
                            ${hasConflict ? 'ring-2 ring-red-500 ring-inset' : ''}
                            ${isHintCell ? 'ring-2 ring-yellow-400 ring-inset animate-pulse' : ''}
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
              <Button 
                onClick={handleHint} 
                variant="outline" 
                className="flex-1"
                disabled={hintCooldown > 0}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {hintCooldown > 0 ? `Wait ${hintCooldown}s` : 'Hint'}
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
