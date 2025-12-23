import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getISTDateKey } from '@/lib/ist';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useStreak = (activityType: 'quiz' | 'sudoku' | 'zip' | 'queens') => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .eq('activity_type', activityType)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Check if streak is still valid (last activity was yesterday or today)
        const today = getISTDateKey();
        const yesterday = getISTDateKey(new Date(Date.now() - 86400000));
        
        if (data.last_activity_date === today || data.last_activity_date === yesterday) {
          setStreak(data);
        } else {
          // Streak is broken, reset current but keep longest
          setStreak({
            current_streak: 0,
            longest_streak: data.longest_streak,
            last_activity_date: data.last_activity_date,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activityType]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    const today = getISTDateKey();
    const yesterday = getISTDateKey(new Date(Date.now() - 86400000));

    try {
      // First, get current streak data
      const { data: existing, error: fetchError } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .eq('activity_type', activityType)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let newCurrentStreak = 1;
      let newLongestStreak = 1;

      if (existing) {
        // Already completed today, no update needed
        if (existing.last_activity_date === today) {
          return;
        }

        // Check if continuing streak (last activity was yesterday)
        if (existing.last_activity_date === yesterday) {
          newCurrentStreak = existing.current_streak + 1;
        } else {
          // Streak broken, start fresh
          newCurrentStreak = 1;
        }

        newLongestStreak = Math.max(newCurrentStreak, existing.longest_streak);
      }

      // Upsert the streak
      const { error: upsertError } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          activity_type: activityType,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,activity_type'
        });

      if (upsertError) throw upsertError;

      setStreak({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
      });
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user, activityType]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    loading,
    updateStreak,
    refreshStreak: fetchStreak,
  };
};
