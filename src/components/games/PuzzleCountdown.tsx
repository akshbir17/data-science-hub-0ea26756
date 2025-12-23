import { useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMsUntilNextMidnightIST } from '@/lib/ist';


const formatCountdown = (ms: number) => {
  if (ms <= 0) return '00:00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

interface PuzzleCountdownProps {
  onRefresh?: () => void;
}

const PuzzleCountdown = ({ onRefresh }: PuzzleCountdownProps) => {
  const [countdown, setCountdown] = useState(() => getMsUntilNextMidnightIST());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getMsUntilNextMidnightIST();
      setCountdown(remaining);
      
      // Auto-refresh when countdown hits zero
      if (remaining <= 0) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Clear any cached data
    sessionStorage.clear();
    // Reload the page
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/30">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Next puzzle in</p>
          <p className="font-mono font-semibold text-foreground">{formatCountdown(countdown)}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
    </div>
  );
};

export default PuzzleCountdown;
