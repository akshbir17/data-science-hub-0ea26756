import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const BIRD_SIZE = 30;
const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;

type Pipe = {
  x: number;
  topHeight: number;
  passed: boolean;
};

const FlappyBirdGame = () => {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastPipeRef = useRef(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('flappy-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setBirdY(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    lastPipeRef.current = 0;
  }, []);

  // Jump
  const jump = useCallback(() => {
    if (gameOver) return;
    if (!isPlaying) {
      setIsPlaying(true);
      setGameOver(false);
    }
    setBirdVelocity(JUMP_FORCE);
  }, [isPlaying, gameOver]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = () => {
      // Update bird position
      setBirdVelocity(v => v + GRAVITY);
      setBirdY(y => {
        const newY = y + birdVelocity;
        
        // Check floor/ceiling collision
        if (newY < 0 || newY > GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          return y;
        }
        return newY;
      });

      // Update pipes
      setPipes(prevPipes => {
        let newPipes = prevPipes
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Add new pipe
        const lastPipe = newPipes[newPipes.length - 1];
        if (!lastPipe || lastPipe.x < GAME_WIDTH - 200) {
          const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({
            x: GAME_WIDTH,
            topHeight,
            passed: false,
          });
        }

        // Check collisions and scoring
        newPipes = newPipes.map(pipe => {
          const birdLeft = 50;
          const birdRight = 50 + BIRD_SIZE;
          const birdTop = birdY;
          const birdBottom = birdY + BIRD_SIZE;

          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;
          const pipeTopBottom = pipe.topHeight;
          const pipeBottomTop = pipe.topHeight + PIPE_GAP;

          // Check collision
          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipeTopBottom || birdBottom > pipeBottomTop) {
              setGameOver(true);
              setIsPlaying(false);
            }
          }

          // Check if passed
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
            setScore(prev => {
              const newScore = prev + 1;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('flappy-high-score', newScore.toString());
              }
              return newScore;
            });
            return { ...pipe, passed: true };
          }

          return pipe;
        });

        return newPipes;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, birdVelocity, birdY, highScore]);

  // Click/touch handler
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleInteraction);
    return () => window.removeEventListener('keydown', handleInteraction);
  }, [jump]);

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
              <h1 className="text-lg font-semibold">Flappy Bird</h1>
              <p className="text-xs text-muted-foreground">Tap to fly!</p>
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
                className="relative mx-auto overflow-hidden rounded-lg border-2 border-border/50 cursor-pointer"
                style={{ 
                  width: GAME_WIDTH, 
                  height: GAME_HEIGHT,
                  background: 'linear-gradient(to bottom, hsl(var(--primary)/0.1), hsl(var(--secondary)))'
                }}
                onClick={jump}
                onTouchStart={(e) => {
                  e.preventDefault();
                  jump();
                }}
              >
                {/* Ground */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-4 bg-secondary border-t-2 border-border/50"
                />

                {/* Bird */}
                <div
                  className="absolute rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-lg transition-transform"
                  style={{
                    left: 50,
                    top: birdY,
                    width: BIRD_SIZE,
                    height: BIRD_SIZE,
                    transform: `rotate(${Math.min(birdVelocity * 3, 45)}deg)`,
                  }}
                >
                  {/* Eye */}
                  <div 
                    className="absolute bg-white rounded-full"
                    style={{
                      right: 5,
                      top: 6,
                      width: 10,
                      height: 10,
                    }}
                  >
                    <div 
                      className="absolute bg-black rounded-full"
                      style={{
                        right: 2,
                        top: 3,
                        width: 4,
                        height: 4,
                      }}
                    />
                  </div>
                  {/* Beak */}
                  <div 
                    className="absolute bg-orange-500"
                    style={{
                      right: -8,
                      top: 12,
                      width: 12,
                      height: 8,
                      clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                    }}
                  />
                </div>

                {/* Pipes */}
                {pipes.map((pipe, index) => (
                  <div key={index}>
                    {/* Top pipe */}
                    <div
                      className="absolute bg-green-500 border-2 border-green-700"
                      style={{
                        left: pipe.x,
                        top: 0,
                        width: PIPE_WIDTH,
                        height: pipe.topHeight,
                        borderRadius: '0 0 8px 8px',
                      }}
                    >
                      <div 
                        className="absolute bottom-0 left-[-4px] right-[-4px] h-6 bg-green-500 border-2 border-green-700 rounded"
                      />
                    </div>
                    {/* Bottom pipe */}
                    <div
                      className="absolute bg-green-500 border-2 border-green-700"
                      style={{
                        left: pipe.x,
                        top: pipe.topHeight + PIPE_GAP,
                        width: PIPE_WIDTH,
                        height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
                        borderRadius: '8px 8px 0 0',
                      }}
                    >
                      <div 
                        className="absolute top-0 left-[-4px] right-[-4px] h-6 bg-green-500 border-2 border-green-700 rounded"
                      />
                    </div>
                  </div>
                ))}

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xl font-bold text-destructive mb-2">Game Over!</p>
                      <p className="text-muted-foreground">Score: {score}</p>
                    </div>
                  </div>
                )}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground mb-2">Flappy Bird</p>
                      <p className="text-sm text-muted-foreground">Tap or press Space to start</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={jump}
              className="gap-2"
              size="lg"
            >
              <Play className="w-5 h-5" />
              {gameOver ? 'Play Again' : 'Tap to Fly'}
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

          <p className="text-xs text-center text-muted-foreground">
            Tap the game area or press Space to flap
          </p>
        </div>
      </main>
    </div>
  );
};

export default FlappyBirdGame;
