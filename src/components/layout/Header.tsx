import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, Upload, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">DS Portal</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Data Science Resources</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {userRole === 'admin' && (
              <Link to="/admin/upload">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Resources</span>
                </Button>
              </Link>
            )}
            
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole || 'Loading...'}
                </p>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
