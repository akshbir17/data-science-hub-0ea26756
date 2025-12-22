import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Clock } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  time_seconds: number;
  full_name: string | null;
  usn: string | null;
}

interface GameLeaderboardProps {
  gameType: 'zip' | 'sudoku';
}

const GameLeaderboard = ({ gameType }: GameLeaderboardProps) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchLeaderboard();
  }, [gameType]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch today's scores with user profiles
      const { data: scores, error: scoresError } = await supabase
        .from('game_scores')
        .select('user_id, time_seconds')
        .eq('game_type', gameType)
        .eq('puzzle_date', todayDate)
        .order('time_seconds', { ascending: true });

      if (scoresError) throw scoresError;

      if (!scores || scores.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      // Fetch user profiles
      const userIds = scores.map(s => s.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, usn')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(
        profiles?.map(p => [p.user_id, { full_name: p.full_name, usn: p.usn }]) || []
      );

      const leaderboard: LeaderboardEntry[] = scores.map((score, index) => ({
        rank: index + 1,
        user_id: score.user_id,
        time_seconds: score.time_seconds,
        full_name: profileMap.get(score.user_id)?.full_name || 'Anonymous',
        usn: profileMap.get(score.user_id)?.usn || null,
      }));

      setEntries(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10';
    if (rank === 2) return 'bg-gray-400/10';
    if (rank === 3) return 'bg-amber-600/10';
    return '';
  };

  if (loading) {
    return (
      <Card className="glass-card border-border/30">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Today's Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {gameType === 'zip' ? 'Zip' : 'Mini Sudoku'} • {entries.length} players today
        </p>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scores yet today</p>
            <p className="text-sm">Be the first to complete the puzzle!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isCurrentUser = entry.user_id === user?.id;
              
              return (
                <div
                  key={entry.user_id}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl transition-colors
                    ${getRankBgColor(entry.rank)}
                    ${isCurrentUser ? 'ring-2 ring-primary/50' : ''}
                  `}
                >
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${isCurrentUser ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                      {getInitials(entry.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {entry.full_name}
                      {isCurrentUser && <span className="text-primary ml-2">(You)</span>}
                    </p>
                    {entry.usn && (
                      <p className="text-xs text-muted-foreground">{entry.usn}</p>
                    )}
                  </div>
                  <div className="font-mono font-bold text-lg">
                    {formatTime(entry.time_seconds)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameLeaderboard;
