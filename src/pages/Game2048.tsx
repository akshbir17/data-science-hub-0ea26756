import { useState, useEffect, useCallback, useRef } from 'react';
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

const getTileStyle = (value: number | null): { bg: string; text: string; shadow: string } => {
  const styles: Record<number, { bg: string; text: string; shadow: string }> = {
    2: { bg: 'linear-gradient(145deg, #eee4da 0%, #e0d6cc 100%)', text: '#776e65', shadow: 'rgba(238, 228, 218, 0.5)' },
    4: { bg: 'linear-gradient(145deg, #ede0c8 0%, #e0d3bb 100%)', text: '#776e65', shadow: 'rgba(237, 224, 200, 0.5)' },
    8: { bg: 'linear-gradient(145deg, #f2b179 0%, #e5a46c 100%)', text: '#f9f6f2', shadow: 'rgba(242, 177, 121, 0.5)' },
    16: { bg: 'linear-gradient(145deg, #f59563 0%, #e88856 100%)', text: '#f9f6f2', shadow: 'rgba(245, 149, 99, 0.5)' },
    32: { bg: 'linear-gradient(145deg, #f67c5f 0%, #e96f52 100%)', text: '#f9f6f2', shadow: 'rgba(246, 124, 95, 0.5)' },
    64: { bg: 'linear-gradient(145deg, #f65e3b 0%, #e9512e 100%)', text: '#f9f6f2', shadow: 'rgba(246, 94, 59, 0.5)' },
    128: { bg: 'linear-gradient(145deg, #edcf72 0%, #e0c265 100%)', text: '#f9f6f2', shadow: 'rgba(237, 207, 114, 0.6)' },
    256: { bg: 'linear-gradient(145deg, #edcc61 0%, #e0bf54 100%)', text: '#f9f6f2', shadow: 'rgba(237, 204, 97, 0.6)' },
    512: { bg: 'linear-gradient(145deg, #edc850 0%, #e0bb43 100%)', text: '#f9f6f2', shadow: 'rgba(237, 200, 80, 0.6)' },
    1024: { bg: 'linear-gradient(145deg, #edc53f 0%, #e0b832 100%)', text: '#f9f6f2', shadow: 'rgba(237, 197, 63, 0.6)' },
    2048: { bg: 'linear-gradient(145deg, #edc22e 0%, #e0b521 100%)', text: '#f9f6f2', shadow: 'rgba(237, 194, 46, 0.8)' },
  };
  return value ? styles[value] || { bg: 'linear-gradient(145deg, #3c3a32 0%, #2f2d25 100%)', text: '#f9f6f2', shadow: 'rgba(60, 58, 50, 0.6)' } : { bg: 'rgba(238, 228, 218, 0.35)', text: 'transparent', shadow: 'none' };
};

const Game2048 = () => {
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

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
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        let direction: 'left' | 'right' | 'up' | 'down';
        switch (e.key.toLowerCase()) {
          case 'arrowup':
          case 'w':
            direction = 'up';
            break;
          case 'arrowdown':
          case 's':
            direction = 'down';
            break;
          case 'arrowleft':
          case 'a':
            direction = 'left';
            break;
          case 'arrowright':
          case 'd':
            direction = 'right';
            break;
          default:
            return;
        }
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    touchStartRef.current = null;
  };

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
          <div className="flex justify-between items-center gap-3">
            <Card className="glass-card border-border/30 flex-1 transform hover:scale-105 transition-transform duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{score}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/30 flex-1 transform hover:scale-105 transition-transform duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Best</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{highScore}</p>
              </CardContent>
            </Card>
            <Button 
              onClick={resetGame} 
              variant="outline" 
              size="icon" 
              className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Game Board */}
          <Card className="glass-card border-border/30 shadow-2xl overflow-hidden">
            <CardContent className="p-4">
              <div 
                ref={gameContainerRef}
                className="relative rounded-xl p-3"
                style={{
                  background: 'linear-gradient(145deg, #bbada0 0%, #a89888 100%)',
                  boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.3)',
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="grid grid-cols-4 gap-3">
                  {grid.flat().map((value, index) => {
                    const style = getTileStyle(value);
                    return (
                      <div
                        key={index}
                        className="aspect-square rounded-lg flex items-center justify-center font-bold transition-all duration-100 transform"
                        style={{
                          background: style.bg,
                          color: style.text,
                          fontSize: value && value >= 1000 ? '1.25rem' : value && value >= 100 ? '1.5rem' : '1.75rem',
                          boxShadow: value ? `0 4px 0 rgba(0,0,0,0.15), 0 6px 20px ${style.shadow}` : 'none',
                          transform: value ? 'translateY(-2px)' : 'none',
                        }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="text-center p-6 rounded-2xl bg-background/95 shadow-2xl animate-scale-in">
                      <p className="text-2xl font-bold text-destructive mb-2">Game Over!</p>
                      <p className="text-foreground text-lg mb-4">Score: {score}</p>
                      <Button onClick={resetGame} className="shadow-lg">Try Again</Button>
                    </div>
                  </div>
                )}

                {/* Won Overlay */}
                {won && !gameOver && (
                  <div className="absolute inset-0 bg-yellow-500/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="text-center p-6 rounded-2xl bg-background/95 shadow-2xl animate-scale-in">
                      <p className="text-2xl font-bold text-yellow-600 mb-2">🎉 You Won!</p>
                      <p className="text-foreground mb-4">Score: {score}</p>
                      <div className="flex gap-3 justify-center">
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
                  className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                  onClick={() => handleMove('up')}
                >
                  <ArrowUp className="w-7 h-7" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                  onClick={() => handleMove('left')}
                >
                  <ArrowLeftIcon className="w-7 h-7" />
                </Button>
                <div className="h-14 w-14" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                  onClick={() => handleMove('right')}
                >
                  <ArrowRight className="w-7 h-7" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                  onClick={() => handleMove('down')}
                >
                  <ArrowDown className="w-7 h-7" />
                </Button>
                <div />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Swipe on board, use arrow keys, or WASD
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Game2048;