import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Megaphone, Plus, Trash2, AlertCircle } from 'lucide-react';
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

interface TimetableSlot {
  subject: string;
  room: string;
  teacher?: string;
}

interface DaySchedule {
  day: string;
  slots: (TimetableSlot | null)[];
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_important: boolean;
  created_at: string;
}

const timetableData: DaySchedule[] = [
  {
    day: 'MON',
    slots: [
      { subject: 'OS', room: '327', teacher: 'ZM' },
      { subject: 'DDCO', room: '327', teacher: 'VD' },
      { subject: 'DSA', room: '327', teacher: 'HP' },
      { subject: 'M3', room: '327', teacher: 'PP' },
      null, // Lunch
      { subject: 'R Lab', room: 'Bot Lab', teacher: 'RG' },
      { subject: 'DSA', room: '327', teacher: 'HP' },
    ],
  },
  {
    day: 'TUE',
    slots: [
      { subject: 'DAR', room: '327', teacher: 'RG' },
      { subject: 'M3', room: '327', teacher: 'PP' },
      { subject: 'OS', room: '327', teacher: 'ZM' },
      { subject: 'DDCO', room: '327', teacher: 'VD' },
      null, // Lunch
      { subject: 'DDCO Lab', room: 'Bot Lab', teacher: 'MN' },
      { subject: 'M3', room: '327', teacher: 'PP' },
    ],
  },
  {
    day: 'WED',
    slots: [
      { subject: 'PHP Lab', room: 'Bot Lab', teacher: 'ZM' },
      { subject: 'M3', room: '327', teacher: 'PP' },
      { subject: 'OS', room: '327', teacher: 'ZM' },
      null,
      null, // Lunch
      { subject: 'DDCO', room: '327', teacher: 'VD' },
      { subject: 'DAR', room: '327', teacher: 'RG' },
      { subject: 'DSA', room: '327', teacher: 'HP' },
    ],
  },
  {
    day: 'THU',
    slots: [
      { subject: 'DDCO', room: '327', teacher: 'VD' },
      { subject: 'M3', room: '327', teacher: 'PP' },
      { subject: 'DAR', room: '327', teacher: 'RG' },
      { subject: 'OS', room: '327', teacher: 'ZM' },
      null, // Lunch
      { subject: 'DSA', room: '327', teacher: 'HP' },
      { subject: 'OS Lab', room: 'Bot Lab', teacher: 'ZM' },
    ],
  },
  {
    day: 'FRI',
    slots: [
      { subject: 'DDCO', room: '327', teacher: 'VD' },
      { subject: 'DSA', room: '327', teacher: 'HP' },
      { subject: 'DAR', room: '327', teacher: 'RG' },
      { subject: 'OS', room: '327', teacher: 'ZM' },
      null, // Lunch
      { subject: 'DSA Lab', room: 'Bot Lab', teacher: 'HP' },
      { subject: 'SCR(UHV)', room: '327', teacher: 'ZM' },
    ],
  },
  {
    day: 'SAT',
    slots: [
      { subject: 'Yoga/Sports/NSS', room: '' },
      null,
      null,
      null,
      null, // Lunch
      null,
      null,
    ],
  },
];

const periods = [
  { period: 1, time: '9:00 - 10:00' },
  { period: 2, time: '10:00 - 11:00' },
  { period: 3, time: '11:00 - 12:00' },
  { period: 4, time: '12:00 - 1:00' },
  { period: 'L', time: '1:00 - 2:00' },
  { period: 5, time: '2:00 - 3:00' },
  { period: 6, time: '3:00 - 4:00' },
  { period: 7, time: '4:00 - 5:00' },
];

const subjectColors: Record<string, string> = {
  'OS': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'DDCO': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'DSA': 'bg-green-500/20 text-green-400 border-green-500/30',
  'M3': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'DAR': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'R Lab': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'DDCO Lab': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'PHP Lab': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'OS Lab': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'DSA Lab': 'bg-green-500/20 text-green-400 border-green-500/30',
  'SCR(UHV)': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Yoga/Sports/NSS': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

const getSubjectColor = (subject: string) => {
  return subjectColors[subject] || 'bg-secondary text-muted-foreground border-border';
};

const getCurrentDay = () => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date().getDay()];
};

const Timetable = () => {
  const currentDay = getCurrentDay();
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
        .order('created_at', { ascending: false })
        .limit(10);
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
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-apple mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-purple shadow-glow-sm">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Class Timetable</h1>
              <p className="text-muted-foreground">3rd Semester - Data Science</p>
            </div>
          </div>
          <Badge className="w-fit bg-primary/10 text-primary border-0 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {currentDay === 'SUN' ? 'Weekend' : `Today: ${currentDay}`}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Timetable Section */}
        <div className="space-y-4">
          {/* Timetable Grid - Desktop */}
          <Card className="glass-card border-0 hidden lg:block overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="p-3 text-left text-sm font-semibold text-foreground border-b border-border/30 min-w-[80px]">
                        DAY
                      </th>
                      {periods.map((p, idx) => (
                        <th 
                          key={idx} 
                          className={`p-3 text-center text-sm font-semibold border-b border-border/30 min-w-[120px] ${
                            p.period === 'L' ? 'bg-muted/50 text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          <div>{p.period === 'L' ? 'LUNCH' : `Period ${p.period}`}</div>
                          <div className="text-xs font-normal text-muted-foreground">{p.time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData.map((day, dayIdx) => (
                      <tr 
                        key={day.day} 
                        className={`${currentDay === day.day ? 'bg-primary/5' : ''} ${
                          dayIdx % 2 === 0 ? 'bg-background' : 'bg-secondary/20'
                        }`}
                      >
                        <td className={`p-3 font-semibold border-b border-border/30 ${
                          currentDay === day.day ? 'text-primary' : 'text-foreground'
                        }`}>
                          {day.day}
                        </td>
                        {day.slots.map((slot, slotIdx) => (
                          <td 
                            key={slotIdx} 
                            className={`p-2 border-b border-border/30 text-center ${
                              slotIdx === 4 ? 'bg-muted/30' : ''
                            }`}
                          >
                            {slotIdx === 4 ? (
                              <span className="text-xs text-muted-foreground">BREAK</span>
                            ) : slot ? (
                              <div className={`rounded-lg p-2 border ${getSubjectColor(slot.subject)}`}>
                                <div className="font-medium text-sm">{slot.subject}</div>
                                {slot.teacher && (
                                  <div className="text-xs opacity-80">{slot.teacher}</div>
                                )}
                                {slot.room && (
                                  <div className="text-xs opacity-60">{slot.room}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Timetable Cards - Mobile */}
          <div className="lg:hidden space-y-4">
            {timetableData.map((day) => (
              <Card 
                key={day.day} 
                className={`glass-card border-0 ${currentDay === day.day ? 'ring-2 ring-primary/50' : ''}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${currentDay === day.day ? 'text-primary' : ''}`}>
                    {day.day}
                    {currentDay === day.day && (
                      <Badge className="ml-2 bg-primary/20 text-primary text-xs">Today</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.slots.map((slot, idx) => {
                    if (idx === 4) {
                      return (
                        <div key={idx} className="py-2 text-center text-sm text-muted-foreground border-y border-dashed border-border/50">
                          🍽️ Lunch Break (1:00 - 2:00)
                        </div>
                      );
                    }
                    if (!slot) return null;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-xl border ${getSubjectColor(slot.subject)}`}
                      >
                        <div>
                          <div className="font-medium">{slot.subject}</div>
                          <div className="text-xs opacity-70">{periods[idx].time}</div>
                          {slot.teacher && (
                            <div className="text-xs opacity-80 mt-0.5">Faculty: {slot.teacher}</div>
                          )}
                        </div>
                        {slot.room && (
                          <Badge variant="outline" className="text-xs">
                            {slot.room}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Subject Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(subjectColors).slice(0, 8).map(([subject, color]) => (
                  <Badge key={subject} className={`${color} border`}>
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Section */}
        <div className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Announcements</CardTitle>
                </div>
                {isAdmin && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Plus className="w-4 h-4" />
                        Add
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
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                      announcement.is_important 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : 'bg-secondary/50 border-border/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {announcement.is_important && (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                          <h3 className={`font-semibold ${announcement.is_important ? 'text-destructive' : ''}`}>
                            {announcement.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatDate(announcement.created_at)}
                        </p>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMutation.mutate(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Timetable;