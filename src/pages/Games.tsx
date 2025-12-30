import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bird, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SnakeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-2 0-4 2-4 4s2 4 4 4 4 2 4 4-2 4-4 4" />
    <circle cx="12" cy="6" r="1" fill="currentColor" />
  </svg>
);

const GameCard = ({ game, index }: { game: { id: string; name: string; description: string; icon: any; color: string; shadowColor: string }; index: number }) => {
  return (
    <Link 
      to={`/games/${game.id}`} 
      className="group perspective-1000 block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="glass-card border-border/30 transition-all duration-500 cursor-pointer h-full transform-gpu preserve-3d hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group-hover:border-primary/50"
        style={{
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;
          e.currentTarget.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) scale(1.02)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        }}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${game.color} blur-xl`} />
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div 
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl`}
              style={{
                boxShadow: `0 10px 30px -10px ${game.shadowColor}`,
              }}
            >
              <game.icon className="w-8 h-8 text-white drop-shadow-md transform transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
          <CardTitle className="group-hover:text-primary transition-colors duration-300 text-xl">
            {game.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-muted-foreground text-sm leading-relaxed">{game.description}</p>
          
          {/* Play indicator */}
          <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-sm font-medium">Play Now</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </div>
        </CardContent>
        
        {/* Border glow */}
        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          style={{
            boxShadow: `inset 0 0 30px ${game.shadowColor}40`,
          }}
        />
      </Card>
    </Link>
  );
};

const Games = () => {
  const games = [
    {
      id: 'snake',
      name: 'Snake',
      description: 'Classic snake game - eat food and grow longer without hitting walls or yourself!',
      icon: SnakeIcon,
      color: 'from-green-500 to-emerald-600',
      shadowColor: 'rgb(34, 197, 94)',
    },
    {
      id: 'flappy-bird',
      name: 'Flappy Bird',
      description: 'Tap to fly through the pipes - how far can you go?',
      icon: Bird,
      color: 'from-yellow-400 to-orange-500',
      shadowColor: 'rgb(251, 191, 36)',
    },
    {
      id: '2048',
      name: '2048',
      description: 'Slide tiles to combine them and reach 2048!',
      icon: Grid3X3,
      color: 'from-amber-500 to-orange-600',
      shadowColor: 'rgb(245, 158, 11)',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full glass">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Games</h1>
              <p className="text-xs text-muted-foreground">Fun arcade games to play anytime!</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
        
        <p className="text-center text-muted-foreground text-sm mt-8">
          Use keyboard arrow keys or WASD for controls on desktop
        </p>
      </main>
    </div>
  );
};

export default Games;