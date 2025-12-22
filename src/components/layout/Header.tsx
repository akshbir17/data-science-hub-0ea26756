import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Calculator, Gamepad2, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfileDropdown from '@/components/profile/UserProfileDropdown';

const Header = () => {
  const { userRole } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl gradient-purple shadow-glow-sm group-hover:shadow-glow transition-all">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-foreground">{t('dsPortal')}</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">{t('dataScience')}</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Link to="/games">
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('games')}</span>
              </Button>
            </Link>

            <Link to="/quiz">
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">{t('quiz')}</span>
              </Button>
            </Link>
            
            <Link to="/calculator">
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">{t('calculator')}</span>
              </Button>
            </Link>
            
            {userRole === 'admin' && (
              <Link to="/admin/upload">
                <Button size="sm" className="gap-2 rounded-xl gradient-purple shadow-glow-sm hover:shadow-glow transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('upload')}</span>
                </Button>
              </Link>
            )}
            
            <UserProfileDropdown />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;