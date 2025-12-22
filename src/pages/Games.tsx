import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Grid3X3, ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStreak } from '@/hooks/useStreak';
import StreakBadge from '@/components/StreakBadge';

const GameCard = ({ game }: { game: { id: string; name: string; description: string; icon: any; color: string } }) => {
  const activityType = game.id as 'sudoku' | 'zip' | 'queens';
  const { streak } = useStreak(activityType);

  return (
    <Link to={`/games/${game.id}`} className="perspective-1000">
      <Card className="glass-card border-border/30 hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full transform-gpu hover:rotate-y-3 hover:-rotate-x-3 hover:scale-105 hover:shadow-xl hover:shadow-primary/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
              <game.icon className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <StreakBadge 
              currentStreak={streak.current_streak} 
              longestStreak={streak.longest_streak}
              size="sm"
            />
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
      id: 'zip',
      name: 'Zip',
      description: 'Connect the dots in order and fill every cell',
      icon: Gamepad2,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'sudoku',
      name: 'Mini Sudoku',
      description: 'Fill the 6x6 grid with numbers 1-6',
      icon: Grid3X3,
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 'queens',
      name: 'Queens',
      description: 'Place one queen per row, column, and color region',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
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
              <h1 className="text-lg font-semibold">Daily Games</h1>
              <p className="text-xs text-muted-foreground">New puzzles every day at 12:00 AM IST</p>
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
