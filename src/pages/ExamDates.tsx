import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

interface ExamSchedule {
  date: string;
  day: string;
  subjectName: string;
  subjectCode: string;
  timing: string;
}

const examSchedule: ExamSchedule[] = [
  { date: '2026-02-02', day: 'Monday', subjectName: 'Mathematics', subjectCode: 'BCS301', timing: '2:00 PM - 5:00 PM' },
  { date: '2026-02-04', day: 'Wednesday', subjectName: 'DDCO', subjectCode: 'BCS302', timing: '2:00 PM - 5:00 PM' },
  { date: '2026-02-06', day: 'Friday', subjectName: 'Operating Systems', subjectCode: 'BCS303', timing: '2:00 PM - 5:00 PM' },
  { date: '2026-02-10', day: 'Tuesday', subjectName: 'Data Structures', subjectCode: 'BCS304', timing: '2:00 PM - 5:00 PM' },
  { date: '2026-02-16', day: 'Monday', subjectName: 'R-Language', subjectCode: 'BDS306C', timing: '2:00 PM - 5:00 PM' },
];

const ExamDates = () => {
  const getExamStatus = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isToday(examDate)) return 'today';
    if (isPast(examDate)) return 'completed';
    return 'upcoming';
  };

  const getDaysUntil = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(examDate, today);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Dates</h1>
          <p className="text-sm text-muted-foreground">III Semester - 2022 Scheme</p>
        </div>
      </div>

      {/* Timing Info */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="font-medium">All exams: 2:00 PM - 5:00 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Schedule */}
      <div className="space-y-3">
        {examSchedule.map((exam) => {
          const status = getExamStatus(exam.date);
          const daysUntil = getDaysUntil(exam.date);
          
          return (
            <Card 
              key={exam.subjectCode}
              className={`glass-card border-border/30 transition-all ${
                status === 'today' 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : status === 'completed'
                  ? 'opacity-60'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date Section */}
                  <div className="flex items-center gap-3 sm:min-w-[180px]">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                      status === 'today' 
                        ? 'bg-primary text-primary-foreground' 
                        : status === 'completed'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-secondary text-foreground'
                    }`}>
                      <span className="text-xs font-medium">
                        {format(new Date(exam.date), 'MMM')}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {format(new Date(exam.date), 'd')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {format(new Date(exam.date), 'dd-MM-yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">{exam.day}</p>
                    </div>
                  </div>

                  {/* Subject Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">{exam.subjectName}</span>
                      <Badge variant="secondary" className="rounded-md text-xs">
                        {exam.subjectCode}
                      </Badge>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {status === 'today' && (
                      <Badge className="bg-primary text-primary-foreground animate-pulse">
                        Today
                      </Badge>
                    )}
                    {status === 'completed' && (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Completed
                      </Badge>
                    )}
                    {status === 'upcoming' && daysUntil <= 7 && (
                      <Badge variant="outline" className="border-orange-500/50 text-orange-500">
                        {daysUntil} days left
                      </Badge>
                    )}
                    {status === 'upcoming' && daysUntil > 7 && (
                      <Badge variant="outline" className="text-muted-foreground">
                        {daysUntil} days
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Info */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Schedule based on 2022 Scheme CBCS</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamDates;
