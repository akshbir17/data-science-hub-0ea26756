import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

// Easy difficulty settings
const GRAVITY = 0.35;
const JUMP_FORCE = -7;
const PIPE_WIDTH = 70;
const PIPE_GAP = 200;
const PIPE_SPEED = 2;
const BIRD_SIZE = 35;
const GAME_WIDTH = 360;
const GAME_HEIGHT = 520;

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
  const [wingUp, setWingUp] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const wingAnimRef = useRef<number>(0);

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
  }, []);

  // Jump
  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!isPlaying) {
      setIsPlaying(true);
      setGameOver(false);
    }
    setBirdVelocity(JUMP_FORCE);
    setWingUp(true);
    setTimeout(() => setWingUp(false), 100);
  }, [isPlaying, gameOver, resetGame]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = () => {
      wingAnimRef.current += 1;
      if (wingAnimRef.current % 10 === 0) {
        setWingUp(w => !w);
      }

      // Update bird position
      setBirdVelocity(v => v + GRAVITY);
      setBirdY(y => {
        const newY = y + birdVelocity;
        
        // Check floor/ceiling collision
        if (newY < 0 || newY > GAME_HEIGHT - BIRD_SIZE - 20) {
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
        if (!lastPipe || lastPipe.x < GAME_WIDTH - 250) {
          const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 150) + 70;
          newPipes.push({
            x: GAME_WIDTH,
            topHeight,
            passed: false,
          });
        }

        // Check collisions and scoring
        newPipes = newPipes.map(pipe => {
          const birdLeft = 60;
          const birdRight = 60 + BIRD_SIZE;
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
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 60) {
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

  // Keyboard handler
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [jump]);

  const birdRotation = Math.min(Math.max(birdVelocity * 4, -30), 60);

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
              <p className="text-xs text-muted-foreground">Tap or Space to fly!</p>
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
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">{score}</p>
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
          <Card className="glass-card border-border/30 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div 
                className="relative mx-auto overflow-hidden cursor-pointer"
                style={{ 
                  width: GAME_WIDTH, 
                  height: GAME_HEIGHT,
                }}
                onClick={jump}
                onTouchStart={(e) => {
                  e.preventDefault();
                  jump();
                }}
              >
                {/* Animated Sky Background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #98D8AA 85%, #6B8E6B 100%)',
                  }}
                />
                
                {/* Animated Clouds */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-pulse"
                      style={{
                        left: `${i * 25 + 10}%`,
                        top: `${10 + i * 8}%`,
                        opacity: 0.8,
                      }}
                    >
                      <div className="flex">
                        <div className="w-8 h-5 bg-white rounded-full" />
                        <div className="w-10 h-6 bg-white rounded-full -ml-3 -mt-1" />
                        <div className="w-6 h-4 bg-white rounded-full -ml-2" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ground with grass */}
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-4 bg-gradient-to-b from-green-400 to-green-600" />
                  <div className="h-12 bg-gradient-to-b from-amber-600 to-amber-800" />
                </div>

                {/* Bird */}
                <div
                  className="absolute transition-transform duration-75"
                  style={{
                    left: 60,
                    top: birdY,
                    width: BIRD_SIZE,
                    height: BIRD_SIZE,
                    transform: `rotate(${birdRotation}deg)`,
                  }}
                >
                  {/* Bird body */}
                  <div 
                    className="absolute inset-0 rounded-full shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #FFD93D 0%, #F4A261 50%, #E76F51 100%)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 -3px 10px rgba(0,0,0,0.2)',
                    }}
                  />
                  
                  {/* Belly */}
                  <div 
                    className="absolute rounded-full"
                    style={{
                      left: '15%',
                      top: '35%',
                      width: '55%',
                      height: '55%',
                      background: '#FFF3CD',
                    }}
                  />
                  
                  {/* Wing */}
                  <div 
                    className="absolute rounded-full transition-all duration-100"
                    style={{
                      left: '10%',
                      top: wingUp ? '20%' : '45%',
                      width: '40%',
                      height: '30%',
                      background: 'linear-gradient(135deg, #E76F51 0%, #D62828 100%)',
                      transform: wingUp ? 'rotate(-20deg)' : 'rotate(10deg)',
                    }}
                  />
                  
                  {/* Eye */}
                  <div 
                    className="absolute bg-white rounded-full shadow-inner"
                    style={{
                      right: '18%',
                      top: '20%',
                      width: '35%',
                      height: '35%',
                    }}
                  >
                    <div 
                      className="absolute bg-black rounded-full"
                      style={{
                        right: '25%',
                        top: '30%',
                        width: '40%',
                        height: '40%',
                      }}
                    />
                    <div 
                      className="absolute bg-white rounded-full"
                      style={{
                        right: '30%',
                        top: '25%',
                        width: '15%',
                        height: '15%',
                      }}
                    />
                  </div>
                  
                  {/* Beak */}
                  <div 
                    className="absolute"
                    style={{
                      right: '-25%',
                      top: '40%',
                      width: '40%',
                      height: '30%',
                      background: 'linear-gradient(135deg, #FF6B35 0%, #D62828 100%)',
                      clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                    }}
                  />
                </div>

                {/* Pipes */}
                {pipes.map((pipe, index) => (
                  <div key={index}>
                    {/* Top pipe */}
                    <div
                      className="absolute"
                      style={{
                        left: pipe.x,
                        top: 0,
                        width: PIPE_WIDTH,
                        height: pipe.topHeight,
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, #228B22 0%, #32CD32 30%, #228B22 70%, #1B5E20 100%)',
                          borderRadius: '0 0 8px 8px',
                          boxShadow: '4px 0 10px rgba(0,0,0,0.3)',
                        }}
                      />
                      {/* Pipe cap */}
                      <div 
                        className="absolute bottom-0 -left-1 -right-1 h-8"
                        style={{
                          background: 'linear-gradient(90deg, #1B5E20 0%, #32CD32 30%, #228B22 70%, #1B5E20 100%)',
                          borderRadius: '4px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        }}
                      />
                      {/* Highlight */}
                      <div 
                        className="absolute top-0 left-2 bottom-8 w-3 opacity-40"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
                        }}
                      />
                    </div>
                    
                    {/* Bottom pipe */}
                    <div
                      className="absolute"
                      style={{
                        left: pipe.x,
                        top: pipe.topHeight + PIPE_GAP,
                        width: PIPE_WIDTH,
                        height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, #228B22 0%, #32CD32 30%, #228B22 70%, #1B5E20 100%)',
                          borderRadius: '8px 8px 0 0',
                          boxShadow: '4px 0 10px rgba(0,0,0,0.3)',
                        }}
                      />
                      {/* Pipe cap */}
                      <div 
                        className="absolute top-0 -left-1 -right-1 h-8"
                        style={{
                          background: 'linear-gradient(90deg, #1B5E20 0%, #32CD32 30%, #228B22 70%, #1B5E20 100%)',
                          borderRadius: '4px',
                          boxShadow: '0 -4px 10px rgba(0,0,0,0.2)',
                        }}
                      />
                      {/* Highlight */}
                      <div 
                        className="absolute top-8 left-2 bottom-0 w-3 opacity-40"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Score floating display */}
                {isPlaying && !gameOver && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <span className="text-5xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {score}
                    </span>
                  </div>
                )}

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-6 rounded-2xl bg-background/90 shadow-2xl transform animate-scale-in">
                      <p className="text-3xl font-bold text-destructive mb-2">Game Over!</p>
                      <p className="text-xl text-foreground">Score: {score}</p>
                      {score === highScore && score > 0 && (
                        <p className="text-primary font-semibold mt-1 animate-pulse">🎉 New High Score!</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-3">Tap or press Space to play again</p>
                    </div>
                  </div>
                )}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-6 rounded-2xl bg-background/90 shadow-2xl">
                      <p className="text-2xl font-bold text-foreground mb-3">🐦 Flappy Bird</p>
                      <p className="text-muted-foreground mb-4">Tap or press Space/↑/W to fly</p>
                      <div className="animate-bounce">
                        <Play className="w-12 h-12 mx-auto text-primary" />
                      </div>
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
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <Play className="w-5 h-5" />
              {gameOver ? 'Play Again' : 'Tap to Fly'}
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

          <p className="text-xs text-center text-muted-foreground">
            Controls: Space, ↑, or W to flap • Click/Tap the game
          </p>
        </div>
      </main>
    </div>
  );
};

export default FlappyBirdGame;