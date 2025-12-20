import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Clock,
  GraduationCap
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
        <Card className="group h-full hover-lift cursor-pointer border-0 bg-card rounded-2xl shadow-apple-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-apple">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs rounded-lg font-medium">
                {subject.code}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-4 group-hover:text-primary transition-apple">
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
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-apple" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-mesh p-8 border border-border/50">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <Badge className="bg-primary/10 text-primary border-0 mb-4 rounded-lg">
              {userRole === 'admin' ? 'Administrator' : 'Student Portal'}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Access your course materials, lecture notes, and study resources. 
              {userRole === 'admin' && ' You can also upload new resources for students.'}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Link to="/calculator">
              <Button variant="outline" className="gap-2 rounded-xl hover-lift">
                <GraduationCap className="w-4 h-4" />
                CGPA Calculator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3rd Semester */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">3rd Semester</h2>
            <p className="text-sm text-muted-foreground">Core subjects and study materials</p>
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="h-48 animate-pulse bg-secondary/50 rounded-2xl border-0" />
            ))}
          </div>
        ) : thirdSemSubjects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <Card className="p-8 text-center rounded-2xl border-0 shadow-apple-sm">
            <p className="text-muted-foreground">No subjects found for 3rd semester.</p>
          </Card>
        )}
      </section>

      {/* 4th Semester */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-apple-purple/10">
            <Clock className="w-5 h-5 text-apple-purple" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">4th Semester</h2>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>
        
        {fourthSemSubjects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <Card className="p-12 text-center border-2 border-dashed border-border bg-secondary/20 rounded-2xl">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">4th Semester Resources</h3>
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