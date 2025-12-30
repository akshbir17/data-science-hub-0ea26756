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

const GameCard = ({ game }: { game: { id: string; name: string; description: string; icon: any; color: string } }) => {
  return (
    <Link to={`/games/${game.id}`} className="perspective-1000">
      <Card className="glass-card border-border/30 hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full transform-gpu hover:rotate-y-3 hover:-rotate-x-3 hover:scale-105 hover:shadow-xl hover:shadow-primary/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
              <game.icon className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
          <CardTitle className="group-hover:text-primary transition-colors">
            {game.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{game.description}</p>
        </CardContent>
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
    },
    {
      id: 'flappy-bird',
      name: 'Flappy Bird',
      description: 'Tap to fly through the pipes - how far can you go?',
      icon: Bird,
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: '2048',
      name: '2048',
      description: 'Slide tiles to combine them and reach 2048!',
      icon: Grid3X3,
      color: 'from-amber-500 to-orange-600',
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
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Games;
