import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimetableSlot {
  subject: string;
  room: string;
  teacher?: string;
}

interface DaySchedule {
  day: string;
  slots: (TimetableSlot | null)[];
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
  );
};

export default Timetable;
