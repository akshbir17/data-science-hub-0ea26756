import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Calculator, 
  Cpu, 
  Code, 
  BarChart, 
  Monitor,
  ChevronRight,
  FolderOpen,
  Clock
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

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceCounts, setResourceCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;

      setSubjects(subjectsData || []);

      // Fetch resource counts for each subject
      if (subjectsData) {
        const counts: Record<string, number> = {};
        for (const subject of subjectsData) {
          const { count } = await supabase
            .from('resources')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id);
          counts[subject.id] = count || 0;
        }
        setResourceCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const thirdSemSubjects = subjects.filter(s => s.semester === '3rd');
  const fourthSemSubjects = subjects.filter(s => s.semester === '4th');

  const SubjectCard = ({ subject }: { subject: Subject }) => {
    const IconComponent = iconMap[subject.icon] || BookOpen;
    const count = resourceCounts[subject.id] || 0;

    return (
      <Link to={`/subject/${subject.id}`}>
        <Card className="group h-full hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary shadow-md group-hover:shadow-lg transition-shadow">
                <IconComponent className="w-6 h-6 text-primary-foreground" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {subject.code}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
              {subject.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {subject.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderOpen className="w-4 h-4" />
                <span>{count} {count === 1 ? 'resource' : 'resources'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative z-10">
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 mb-4">
            {userRole === 'admin' ? 'Administrator' : 'Student Portal'}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Access your course materials, lecture notes, and study resources. 
            {userRole === 'admin' && ' You can also upload new resources for students.'}
          </p>
        </div>
      </div>

      {/* 3rd Semester */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">3rd Semester</h2>
            <p className="text-sm text-muted-foreground">Core subjects and study materials</p>
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : thirdSemSubjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {thirdSemSubjects.map((subject, index) => (
              <div 
                key={subject.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SubjectCard subject={subject} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No subjects found for 3rd semester.</p>
          </Card>
        )}
      </section>

      {/* 4th Semester */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">4th Semester</h2>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>
        
        {fourthSemSubjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fourthSemSubjects.map((subject, index) => (
              <div 
                key={subject.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SubjectCard subject={subject} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-2 bg-muted/30">
            <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-1">4th Semester Resources</h3>
            <p className="text-muted-foreground text-sm">
              Subjects and materials will be added soon. Stay tuned!
            </p>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
