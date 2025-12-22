import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  size?: 'sm' | 'md';
}

const StreakBadge = ({ currentStreak, longestStreak, size = 'md' }: StreakBadgeProps) => {
  if (currentStreak === 0 && longestStreak === 0) {
    return null;
  }

  const isActive = currentStreak > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant={isActive ? 'default' : 'secondary'}
          className={`gap-1 ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''} ${
            isActive ? 'bg-orange-500 hover:bg-orange-600' : ''
          }`}
        >
          <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Current streak: {currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
        <p className="text-muted-foreground">Best: {longestStreak} day{longestStreak !== 1 ? 's' : ''}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default StreakBadge;
