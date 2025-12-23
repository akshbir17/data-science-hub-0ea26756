import { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Get current date in IST (UTC+5:30)
const getISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
};

// Get milliseconds until midnight IST
const getMsUntilMidnightIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  
  // Get midnight IST (start of next day)
  const midnightIST = new Date(istNow);
  midnightIST.setUTCHours(24, 0, 0, 0); // Next midnight
  midnightIST.setUTCDate(istNow.getUTCDate() + 1);
  midnightIST.setUTCHours(0, 0, 0, 0);
  
  // Calculate the actual midnight IST in UTC
  const nextMidnightIST = new Date(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate() + 1,
    0, 0, 0, 0
  );
  
  // Convert back to UTC by subtracting IST offset
  const nextMidnightUTC = nextMidnightIST.getTime() - istOffset;
  
  return nextMidnightUTC - now.getTime();
};

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
  const [countdown, setCountdown] = useState(getMsUntilMidnightIST());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getMsUntilMidnightIST();
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
