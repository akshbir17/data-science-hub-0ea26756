import { useState } from 'react';
import { User, Settings, Bell, LogOut, ChevronRight, Sun, Moon, Share2, Globe, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import ProfileEditDialog from './ProfileEditDialog';
import ShareDialog from './ShareDialog';

const UserProfileDropdown = () => {
  const { user, userRole, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { isAllowed, toggleNotifications } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNotificationToggle = async () => {
    await toggleNotifications();
    toast({
      title: isAllowed ? 'Notifications' : 'Notifications Enabled',
      description: isAllowed 
        ? 'To disable notifications, please use your browser settings'
        : 'You will now receive notifications',
    });
  };

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 pl-3 ml-2 border-l border-border/50 focus:outline-none">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole || 'Loading...'}
              </p>
            </div>
            <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarFallback className="bg-primary/20 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-card border border-border shadow-lg z-50"
          sideOffset={8}
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 p-3 border-b border-border">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{userName}</p>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1">
            <DropdownMenuItem 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>

            {/* Settings Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center justify-between py-2.5 px-3 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-52 bg-card border border-border shadow-lg z-50">
                  <div className="p-2 space-y-3">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between py-2 px-2">
                      <span className="text-sm">Theme</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setTheme('light')}
                          className={`p-1.5 rounded-md transition-colors ${
                            theme === 'light' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`p-1.5 rounded-md transition-colors ${
                            theme === 'dark' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Language Selector */}
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center gap-2 px-2 pb-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Language</span>
                      </div>
                      <div className="space-y-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`w-full flex items-center justify-between py-1.5 px-3 rounded-md text-sm transition-colors ${
                              language === lang.code 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-muted'
                            }`}
                          >
                            <span>{lang.name} ({lang.nativeName})</span>
                            {language === lang.code && <Check className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {/* Notification Toggle */}
            <DropdownMenuItem 
              className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Notification</span>
              </div>
              <Switch 
                checked={isAllowed} 
                onCheckedChange={handleNotificationToggle}
                className="data-[state=checked]:bg-primary"
              />
            </DropdownMenuItem>

            {/* Share Option */}
            <DropdownMenuItem 
              onClick={() => setIsShareOpen(true)}
              className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span>Share App</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {/* Logout */}
          <div className="p-1">
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-3 py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <ShareDialog open={isShareOpen} onOpenChange={setIsShareOpen} />
    </>
  );
};

export default UserProfileDropdown;
