import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  const clearAuthStorage = () => {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }

    try {
      Object.keys(window.sessionStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => window.sessionStorage.removeItem(k));
    } catch {
      // ignore
    }
  };

  const handleResetLogin = () => {
    // Best-effort sign-out; if offline, still clear local auth state.
    void supabase.auth.signOut().catch(() => {});
    clearAuthStorage();
    window.location.assign('/auth');
  };

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setTimedOut(true), 10000);
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-purple shadow-glow flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>

          {timedOut && (
            <div className="mt-1 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Having trouble loading? Check your internet and tap Retry. If it still gets stuck, tap Reset Login.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button variant="destructive" onClick={handleResetLogin} className="rounded-xl">
                  <LogOut className="w-4 h-4 mr-2" />
                  Reset Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;