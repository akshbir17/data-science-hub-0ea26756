import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from 'lucide-react';

const GRID_SIZE = 4;

type Grid = (number | null)[][];

const getEmptyCells = (grid: Grid): [number, number][] => {
  const empty: [number, number][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === null) {
        empty.push([i, j]);
      }
    }
  }
  return empty;
};

const addRandomTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row]);
  const emptyCells = getEmptyCells(newGrid);
  if (emptyCells.length === 0) return newGrid;
  
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const createInitialGrid = (): Grid => {
  let grid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return grid;
};

const rotateGrid = (grid: Grid, times: number): Grid => {
  let result = grid.map(row => [...row]);
  for (let t = 0; t < times; t++) {
    const newGrid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        newGrid[j][GRID_SIZE - 1 - i] = result[i][j];
      }
    }
    result = newGrid;
  }
  return result;
};

const slideLeft = (grid: Grid): { grid: Grid; score: number; moved: boolean } => {
  let score = 0;
  let moved = false;
  const newGrid: Grid = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    const row = grid[i].filter(cell => cell !== null) as number[];
    const newRow: (number | null)[] = [];
    
    for (let j = 0; j < row.length; j++) {
      if (j + 1 < row.length && row[j] === row[j + 1]) {
        const merged = row[j] * 2;
        newRow.push(merged);
        score += merged;
        j++;
        moved = true;
      } else {
        newRow.push(row[j]);
      }
    }
    
    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }
    
    if (!moved) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] !== newRow[j]) {
          moved = true;
          break;
        }
      }
    }
    
    newGrid.push(newRow);
  }

  return { grid: newGrid, score, moved };
};

const move = (grid: Grid, direction: 'left' | 'right' | 'up' | 'down'): { grid: Grid; score: number; moved: boolean } => {
  const rotations: Record<string, number> = { left: 0, up: 1, right: 2, down: 3 };
  const rotation = rotations[direction];
  
  let rotatedGrid = rotateGrid(grid, rotation);
  const result = slideLeft(rotatedGrid);
  result.grid = rotateGrid(result.grid, (4 - rotation) % 4);
  
  return result;
};

const canMove = (grid: Grid): boolean => {
  // Check for empty cells
  if (getEmptyCells(grid).length > 0) return true;
  
  // Check for possible merges
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const current = grid[i][j];
      if (j + 1 < GRID_SIZE && grid[i][j + 1] === current) return true;
      if (i + 1 < GRID_SIZE && grid[i + 1][j] === current) return true;
    }
  }
  
  return false;
};

const hasWon = (grid: Grid): boolean => {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 2048) return true;
    }
  }
  return false;
};

const getTileColor = (value: number | null): string => {
  const colors: Record<number, string> = {
    2: 'bg-amber-100 text-amber-900',
    4: 'bg-amber-200 text-amber-900',
    8: 'bg-orange-300 text-white',
    16: 'bg-orange-400 text-white',
    32: 'bg-orange-500 text-white',
    64: 'bg-red-500 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white',
    1024: 'bg-yellow-700 text-white',
    2048: 'bg-yellow-500 text-white',
  };
  return value ? colors[value] || 'bg-purple-600 text-white' : 'bg-secondary/50';
};

const Game2048 = () => {
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('2048-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;

    const result = move(grid, direction);
    if (result.moved) {
      let newGrid = addRandomTile(result.grid);
      setGrid(newGrid);
      
      const newScore = score + result.score;
      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('2048-high-score', newScore.toString());
      }

      if (hasWon(newGrid) && !won) {
        setWon(true);
      }

      if (!canMove(newGrid)) {
        setGameOver(true);
      }
    }
  }, [grid, score, highScore, gameOver, won]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down';
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const resetGame = () => {
    setGrid(createInitialGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

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
              <h1 className="text-lg font-semibold">2048</h1>
              <p className="text-xs text-muted-foreground">Combine tiles to reach 2048!</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Score Display */}
          <div className="flex justify-between items-center gap-4">
            <Card className="glass-card border-border/30 flex-1">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-primary">{score}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/30 flex-1">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Best</p>
                <p className="text-2xl font-bold text-yellow-500">{highScore}</p>
              </CardContent>
            </Card>
            <Button onClick={resetGame} variant="outline" size="icon" className="h-14 w-14">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Game Board */}
          <Card className="glass-card border-border/30">
            <CardContent className="p-4">
              <div className="relative bg-secondary/80 rounded-lg p-2">
                <div className="grid grid-cols-4 gap-2">
                  {grid.flat().map((value, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-100 ${getTileColor(value)}`}
                    >
                      {value}
                    </div>
                  ))}
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold text-destructive mb-2">Game Over!</p>
                      <p className="text-muted-foreground mb-4">Score: {score}</p>
                      <Button onClick={resetGame}>Try Again</Button>
                    </div>
                  </div>
                )}

                {/* Won Overlay */}
                {won && !gameOver && (
                  <div className="absolute inset-0 bg-yellow-500/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white mb-2">🎉 You Won!</p>
                      <p className="text-white/90 mb-4">Score: {score}</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => setWon(false)} variant="secondary">Keep Playing</Button>
                        <Button onClick={resetGame}>New Game</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Touch Controls */}
          <Card className="glass-card border-border/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleMove('up')}
                >
                  <ArrowUp className="w-6 h-6" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleMove('left')}
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </Button>
                <div className="h-12 w-12" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleMove('right')}
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleMove('down')}
                >
                  <ArrowDown className="w-6 h-6" />
                </Button>
                <div />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Use arrow keys or tap buttons
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Game2048;
