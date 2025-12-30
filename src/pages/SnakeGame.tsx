import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('snake-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
  }, [generateFood]);

  // Game loop
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDirection = directionRef.current;
      
      let newHead: Position;
      switch (currentDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        return newSnake; // Don't remove tail - snake grows
      }

      newSnake.pop(); // Remove tail
      return newSnake;
    });
  }, [food, highScore, generateFood]);

  // Start/stop game loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying && !gameOver && (e.key.startsWith('Arrow') || ['w', 'a', 's', 'd'].includes(e.key.toLowerCase()))) {
        startGame();
      }
      
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (directionRef.current !== 'DOWN') {
            directionRef.current = 'UP';
            setDirection('UP');
          }
          break;
        case 'arrowdown':
        case 's':
          if (directionRef.current !== 'UP') {
            directionRef.current = 'DOWN';
            setDirection('DOWN');
          }
          break;
        case 'arrowleft':
        case 'a':
          if (directionRef.current !== 'RIGHT') {
            directionRef.current = 'LEFT';
            setDirection('LEFT');
          }
          break;
        case 'arrowright':
        case 'd':
          if (directionRef.current !== 'LEFT') {
            directionRef.current = 'RIGHT';
            setDirection('RIGHT');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Touch controls
  const handleDirectionChange = (newDirection: Direction) => {
    if (!isPlaying) {
      startGame();
    }
    
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    
    if (directionRef.current !== opposites[newDirection]) {
      directionRef.current = newDirection;
      setDirection(newDirection);
    }
  };

  const startGame = () => {
    if (gameOver) resetGame();
    setIsPlaying(true);
    setGameOver(false);
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
              <h1 className="text-lg font-semibold">Snake</h1>
              <p className="text-xs text-muted-foreground">Classic snake game</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Score Display */}
          <div className="flex justify-between items-center gap-4">
            <Card className="glass-card border-border/30 flex-1 transform hover:scale-105 transition-transform duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{score}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/30 flex-1 transform hover:scale-105 transition-transform duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">High Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{highScore}</p>
              </CardContent>
            </Card>
          </div>

          {/* Game Board */}
          <Card className="glass-card border-border/30 shadow-2xl overflow-hidden">
            <CardContent className="p-4">
              <div 
                className="relative mx-auto rounded-xl overflow-hidden"
                style={{ 
                  width: GRID_SIZE * CELL_SIZE, 
                  height: GRID_SIZE * CELL_SIZE,
                  background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5)',
                }}
              >
                {/* Grid pattern */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                  }}
                />

                {/* Snake */}
                {snake.map((segment, index) => {
                  const isHead = index === 0;
                  const isTail = index === snake.length - 1;
                  return (
                    <div
                      key={index}
                      className="absolute transition-all duration-75"
                      style={{
                        left: segment.x * CELL_SIZE,
                        top: segment.y * CELL_SIZE,
                        width: CELL_SIZE - 1,
                        height: CELL_SIZE - 1,
                        background: isHead 
                          ? 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' 
                          : `linear-gradient(135deg, hsl(${140 - index * 3}, 80%, ${55 - index}%) 0%, hsl(${140 - index * 3}, 70%, ${45 - index}%) 100%)`,
                        borderRadius: isHead ? '6px' : isTail ? '4px' : '3px',
                        boxShadow: isHead 
                          ? '0 0 15px rgba(0, 255, 136, 0.6), 0 0 30px rgba(0, 255, 136, 0.3)' 
                          : '0 2px 4px rgba(0,0,0,0.3)',
                        transform: isHead ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {isHead && (
                        <>
                          {/* Eyes */}
                          <div 
                            className="absolute bg-white rounded-full"
                            style={{
                              width: 4,
                              height: 4,
                              top: 3,
                              left: direction === 'LEFT' ? 2 : direction === 'RIGHT' ? 8 : 3,
                            }}
                          >
                            <div className="absolute bg-black rounded-full" style={{ width: 2, height: 2, top: 1, left: 1 }} />
                          </div>
                          <div 
                            className="absolute bg-white rounded-full"
                            style={{
                              width: 4,
                              height: 4,
                              top: 3,
                              left: direction === 'LEFT' ? 8 : direction === 'RIGHT' ? 2 : 9,
                            }}
                          >
                            <div className="absolute bg-black rounded-full" style={{ width: 2, height: 2, top: 1, left: 1 }} />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                
                {/* Food */}
                <div
                  className="absolute animate-pulse"
                  style={{
                    left: food.x * CELL_SIZE,
                    top: food.y * CELL_SIZE,
                    width: CELL_SIZE - 1,
                    height: CELL_SIZE - 1,
                    background: 'radial-gradient(circle, #ff6b6b 0%, #ee5a5a 50%, #c0392b 100%)',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px rgba(255, 107, 107, 0.8), 0 0 30px rgba(255, 107, 107, 0.4)',
                  }}
                >
                  {/* Apple stem */}
                  <div 
                    className="absolute bg-green-600 rounded"
                    style={{
                      width: 2,
                      height: 4,
                      top: -2,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(15deg)',
                    }}
                  />
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center p-4 rounded-xl bg-background/90 shadow-2xl animate-scale-in">
                      <p className="text-2xl font-bold text-destructive mb-2">Game Over!</p>
                      <p className="text-foreground text-lg">Score: {score}</p>
                      {score === highScore && score > 0 && (
                        <p className="text-primary font-semibold mt-1 animate-pulse">🎉 New High Score!</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground mb-2">🐍 Snake</p>
                      <p className="text-muted-foreground text-sm">Press arrow keys or WASD</p>
                      <div className="mt-3 animate-bounce">
                        <Play className="w-8 h-8 mx-auto text-primary" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-4">
            {/* Play/Reset Buttons */}
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={startGame}
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Play className="w-5 h-5" />
                {gameOver ? 'Play Again' : 'Play'}
              </Button>
              <Button 
                onClick={resetGame}
                variant="outline"
                size="lg"
                className="gap-2 hover:scale-105 transition-transform duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </div>

            {/* Direction Pad (for mobile) */}
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center text-muted-foreground">Touch Controls</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                    onTouchStart={() => handleDirectionChange('UP')}
                    onClick={() => handleDirectionChange('UP')}
                  >
                    <ArrowUp className="w-7 h-7" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                    onTouchStart={() => handleDirectionChange('LEFT')}
                    onClick={() => handleDirectionChange('LEFT')}
                  >
                    <ArrowLeftIcon className="w-7 h-7" />
                  </Button>
                  <div className="h-14 w-14" />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                    onTouchStart={() => handleDirectionChange('RIGHT')}
                    onClick={() => handleDirectionChange('RIGHT')}
                  >
                    <ArrowRight className="w-7 h-7" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-b from-secondary to-secondary/80"
                    onTouchStart={() => handleDirectionChange('DOWN')}
                    onClick={() => handleDirectionChange('DOWN')}
                  >
                    <ArrowDown className="w-7 h-7" />
                  </Button>
                  <div />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Keyboard: Arrow keys or WASD
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SnakeGame;