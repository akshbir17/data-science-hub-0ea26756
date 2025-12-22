import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string | null;
  usn: string | null;
  mobile_number: string | null;
  location: string | null;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileEditDialog = ({ open, onOpenChange }: ProfileEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    usn: '',
    mobile_number: '',
    location: '',
  });

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, usn, mobile_number, location')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setProfile({
        full_name: data.full_name || user.user_metadata?.full_name || '',
        usn: data.usn || '',
        mobile_number: data.mobile_number || '',
        location: data.location || '',
      });
    } else {
      setProfile({
        full_name: user.user_metadata?.full_name || '',
        usn: user.user_metadata?.usn || '',
        mobile_number: '',
        location: '',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          usn: profile.usn,
          mobile_number: profile.mobile_number,
          location: profile.location,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const userName = profile.full_name || 'User';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg font-semibold">{userName}</DialogTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Name</span>
            <Input
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-48 text-right border-none bg-transparent focus-visible:ring-0 px-0"
              placeholder="Your name"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Email account</span>
            <span className="text-sm text-foreground">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">USN</span>
            <Input
              value={profile.usn || ''}
              onChange={(e) => setProfile({ ...profile, usn: e.target.value })}
              className="w-48 text-right border-none bg-transparent focus-visible:ring-0 px-0"
              placeholder="Add USN"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Mobile number</span>
            <Input
              value={profile.mobile_number || ''}
              onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
              className="w-48 text-right border-none bg-transparent focus-visible:ring-0 px-0"
              placeholder="Add number"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Location</span>
            <Input
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-48 text-right border-none bg-transparent focus-visible:ring-0 px-0"
              placeholder="Add location"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-4 gradient-purple"
          >
            {loading ? 'Saving...' : 'Save Change'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
