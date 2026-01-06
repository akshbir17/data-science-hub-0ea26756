import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { 
  BookOpen, 
  Calculator, 
  Cpu, 
  Code, 
  BarChart, 
  Monitor,
  ChevronRight,
  FolderOpen,
  Clock,
  GraduationCap,
  Sparkles,
  Calendar,
  ClipboardList
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  Cpu,
  Code,
  BarChart,
  Monitor,
  BookOpen,
};

// Circular progress component
const CircularProgress = ({ progress, size = 48 }: { progress: number; size?: number }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        stroke="hsla(265, 40%, 35%, 0.3)"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(270, 80%, 65%)" />
          <stop offset="100%" stopColor="hsl(280, 85%, 70%)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  const [isTeacher, setIsTeacher] = useState(false);

  // Fetcher for subjects with resource counts
  const fetchSubjectsData = useCallback(async () => {
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (subjectsError) throw subjectsError;

    const subjects = subjectsData || [];
    const counts: Record<string, number> = {};

    if (subjects.length > 0) {
      // Fetch all resource counts in parallel for better performance
      const countPromises = subjects.map(async (subject) => {
        const { count } = await supabase
          .from('resources')
          .select('*', { count: 'exact', head: true })
          .eq('subject_id', subject.id);
        return { id: subject.id, count: count || 0 };
      });

      const results = await Promise.all(countPromises);
      results.forEach(({ id, count }) => {
        counts[id] = count;
      });
    }

    return { subjects, resourceCounts: counts };
  }, []);

  // Use offline cache with stale-while-revalidate
  const { data: cachedData, loading, isStale } = useOfflineCache(
    'dashboard_subjects',
    fetchSubjectsData,
    { ttl: 1000 * 60 * 30 } // 30 minutes TTL
  );

  const subjects = cachedData?.subjects || [];
  const resourceCounts = cachedData?.resourceCounts || {};

  useEffect(() => {
    if (user) {
      checkIfTeacher();
    }
  }, [user]);

  const checkIfTeacher = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('usn')
      .eq('user_id', user.id)
      .maybeSingle();
    // Teacher = no USN
    setIsTeacher(!data?.usn);
  };

  const thirdSemSubjects = subjects.filter(s => s.semester === '3rd');
  const fourthSemSubjects = subjects.filter(s => s.semester === '4th');

  const SubjectCard = ({ subject, index }: { subject: Subject; index: number }) => {
    const IconComponent = iconMap[subject.icon] || BookOpen;
    const count = resourceCounts[subject.id] || 0;
    const progress = Math.min(count * 10, 100); // Example progress calculation

    return (
      <Link to={`/subject/${subject.id}`}>
        <div className="group glass-card rounded-3xl p-5 hover-lift cursor-pointer h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-purple shadow-glow-sm">
              <IconComponent className="w-6 h-6 text-primary-foreground" />
            </div>
            <CircularProgress progress={progress} size={44} />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {subject.code}
            </p>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-gradient transition-colors">
              {subject.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {subject.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderOpen className="w-4 h-4" />
              <span>{count} {t('resources').toLowerCase()}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    );
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-8">
        {/* Background glow effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-accent/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground mb-2">{t('hello')},</p>
          <h1 className="text-4xl font-bold text-gradient mb-2">{firstName}</h1>
          
          {/* Tab-like navigation */}
          <div className="flex gap-2 mt-6 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {userRole === 'admin' ? t('admin') : (isTeacher ? 'Professor' : t('student'))}
            </Badge>
            <Link to="/calculator">
              <Badge variant="outline" className="bg-secondary/50 border-border/50 px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">
                <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                {t('cgpaCalculator')}
              </Badge>
            </Link>
            <Link to="/timetable">
              <Badge variant="outline" className="bg-secondary/50 border-border/50 px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Timetable
              </Badge>
            </Link>
            <Link to="/exam-dates">
              <Badge variant="outline" className="bg-secondary/50 border-border/50 px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">
                <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                Exam Dates
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('totalSubjects')}</p>
            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{subjects.length}</p>
        </div>
        
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('resources')}</p>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {Object.values(resourceCounts).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>

      {/* 3rd Semester */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-purple shadow-glow-sm">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t('thirdSemester')}</h2>
            <p className="text-sm text-muted-foreground">{t('coreSubjects')}</p>
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-52 animate-pulse glass-card rounded-3xl" />
            ))}
          </div>
        ) : thirdSemSubjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thirdSemSubjects.map((subject, index) => (
              <div 
                key={subject.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SubjectCard subject={subject} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center rounded-3xl">
            <p className="text-muted-foreground">{t('noSubjectsFound')}</p>
          </div>
        )}
      </section>

      {/* 4th Semester */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t('fourthSemester')}</h2>
            <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
          </div>
        </div>
        
        {fourthSemSubjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fourthSemSubjects.map((subject, index) => (
              <div 
                key={subject.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SubjectCard subject={subject} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 text-center rounded-3xl border-2 border-dashed border-border/50">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">{t('fourthSemResources')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('stayTuned')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;