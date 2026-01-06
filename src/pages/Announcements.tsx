import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Megaphone, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_important: boolean;
  created_at: string;
}

const Announcements = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    is_important: false,
  });

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  // Create announcement
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        is_important: newAnnouncement.is_important,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement posted!');
      setDialogOpen(false);
      setNewAnnouncement({ title: '', message: '', is_important: false });
    },
    onError: () => {
      toast.error('Failed to post announcement');
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
    },
    onError: () => {
      toast.error('Failed to delete announcement');
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-purple shadow-glow-sm">
              <Megaphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
              <p className="text-sm text-muted-foreground">Important notices and updates</p>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your announcement..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="important"
                    checked={newAnnouncement.is_important}
                    onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, is_important: checked }))}
                  />
                  <Label htmlFor="important">Mark as Important</Label>
                </div>
                <Button 
                  onClick={() => createMutation.mutate()} 
                  disabled={!newAnnouncement.title || !newAnnouncement.message || createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Announcements List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="glass-card border-0 animate-pulse h-40" />
          ))
        ) : announcements.length === 0 ? (
          <Card className="glass-card border-0 md:col-span-2 lg:col-span-3">
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Megaphone className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">No Announcements</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    There are no announcements at the moment. Check back later for updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`glass-card border-0 ${
                announcement.is_important ? 'ring-2 ring-red-500/50 bg-red-500/5' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {announcement.is_important && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <CardTitle className={`text-base ${announcement.is_important ? 'text-red-500' : ''}`}>
                        {announcement.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(announcement.created_at)}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => deleteMutation.mutate(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {announcement.message}
                </p>
                {announcement.is_important && (
                  <Badge className="mt-3 bg-red-500/20 text-red-500 border-red-500/30">
                    Important
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
