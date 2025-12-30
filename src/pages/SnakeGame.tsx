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
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            directionRef.current = 'UP';
            setDirection('UP');
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            directionRef.current = 'DOWN';
            setDirection('DOWN');
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            directionRef.current = 'LEFT';
            setDirection('LEFT');
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            directionRef.current = 'RIGHT';
            setDirection('RIGHT');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Touch controls
  const handleDirectionChange = (newDirection: Direction) => {
    if (!isPlaying) return;
    
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
          <div className="flex justify-between items-center">
            <Card className="glass-card border-border/30 flex-1 mr-2">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-primary">{score}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/30 flex-1 ml-2">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">High Score</p>
                <p className="text-2xl font-bold text-yellow-500">{highScore}</p>
              </CardContent>
            </Card>
          </div>

          {/* Game Board */}
          <Card className="glass-card border-border/30">
            <CardContent className="p-4">
              <div 
                className="relative mx-auto bg-secondary/50 rounded-lg border-2 border-border/50"
                style={{ 
                  width: GRID_SIZE * CELL_SIZE, 
                  height: GRID_SIZE * CELL_SIZE 
                }}
              >
                {/* Snake */}
                {snake.map((segment, index) => (
                  <div
                    key={index}
                    className={`absolute rounded-sm ${index === 0 ? 'bg-primary' : 'bg-primary/70'}`}
                    style={{
                      left: segment.x * CELL_SIZE,
                      top: segment.y * CELL_SIZE,
                      width: CELL_SIZE - 1,
                      height: CELL_SIZE - 1,
                    }}
                  />
                ))}
                
                {/* Food */}
                <div
                  className="absolute bg-red-500 rounded-full animate-pulse"
                  style={{
                    left: food.x * CELL_SIZE,
                    top: food.y * CELL_SIZE,
                    width: CELL_SIZE - 1,
                    height: CELL_SIZE - 1,
                  }}
                />

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold text-destructive mb-2">Game Over!</p>
                      <p className="text-muted-foreground">Score: {score}</p>
                    </div>
                  </div>
                )}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
                    <p className="text-muted-foreground">Press Play to start</p>
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
                className="gap-2"
                size="lg"
              >
                <Play className="w-5 h-5" />
                {gameOver ? 'Play Again' : 'Play'}
              </Button>
              <Button 
                onClick={resetGame}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </div>

            {/* Direction Pad (for mobile) */}
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center text-muted-foreground">Controls</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onTouchStart={() => handleDirectionChange('UP')}
                    onClick={() => handleDirectionChange('UP')}
                  >
                    <ArrowUp className="w-6 h-6" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onTouchStart={() => handleDirectionChange('LEFT')}
                    onClick={() => handleDirectionChange('LEFT')}
                  >
                    <ArrowLeftIcon className="w-6 h-6" />
                  </Button>
                  <div className="h-12 w-12" />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onTouchStart={() => handleDirectionChange('RIGHT')}
                    onClick={() => handleDirectionChange('RIGHT')}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onTouchStart={() => handleDirectionChange('DOWN')}
                    onClick={() => handleDirectionChange('DOWN')}
                  >
                    <ArrowDown className="w-6 h-6" />
                  </Button>
                  <div />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Use arrow keys or tap buttons to control
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
