import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  Loader2,
  FolderOpen,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  description: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  resource_type: string;
  created_at: string;
}

const Subject = () => {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSubjectAndResources();
    }
  }, [id]);

  const fetchSubjectAndResources = async () => {
    try {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('subject_id', id)
        .order('created_at', { ascending: false });

      if (resourcesError) throw resourcesError;
      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDownload = async (resource: Resource) => {
    const url = getFileUrl(resource.file_path);
    const link = document.createElement('a');
    link.href = url;
    link.download = resource.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (resource: Resource) => {
    const url = getFileUrl(resource.file_path);
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const materials = resources.filter(r => r.resource_type === 'material');
  const pyqs = resources.filter(r => r.resource_type === 'pyq');

  const ResourceCard = ({ resource, index }: { resource: Resource; index: number }) => (
    <Card 
      className="group hover:shadow-apple-lg transition-apple animate-fade-in-up border-0 bg-card rounded-2xl shadow-apple-sm"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-apple">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {resource.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {resource.file_name}
              </span>
              <span>{formatFileSize(resource.file_size)}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(resource.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleView(resource)}
              className="gap-2 rounded-xl"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownload(resource)}
              className="gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ type }: { type: 'material' | 'pyq' }) => (
    <div className="p-12 text-center rounded-3xl border-2 border-dashed border-border bg-secondary/20">
      <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="font-semibold text-foreground mb-2">
        No {type === 'pyq' ? 'Past Year Questions' : 'Study Materials'} Yet
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        {type === 'pyq' 
          ? 'Past year question papers will be uploaded soon. Check back later!'
          : 'Study materials haven\'t been uploaded yet. Check back later or contact your administrator.'}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Subject not found.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4 rounded-xl">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-apple mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
              <Badge variant="secondary" className="rounded-lg">{subject.code}</Badge>
            </div>
            <p className="text-muted-foreground">{subject.description}</p>
          </div>
          <Badge className="w-fit bg-primary/10 text-primary border-0 rounded-lg">
            {subject.semester} Semester
          </Badge>
        </div>
      </div>

      {/* Resources Tabs */}
      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="h-12 p-1 bg-secondary rounded-2xl w-full sm:w-auto">
          <TabsTrigger
            value="materials"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-apple-sm gap-2 px-4"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Study Materials</span>
            <span className="sm:hidden">Materials</span>
            {materials.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs rounded-md">
                {materials.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="pyq"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-apple-sm gap-2 px-4"
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Past Year Questions</span>
            <span className="sm:hidden">PYQs</span>
            {pyqs.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs rounded-md">
                {pyqs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4 animate-fade-in">
          {materials.length > 0 ? (
            materials.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} />
            ))
          ) : (
            <EmptyState type="material" />
          )}
        </TabsContent>

        <TabsContent value="pyq" className="space-y-4 animate-fade-in">
          {pyqs.length > 0 ? (
            pyqs.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} />
            ))
          ) : (
            <EmptyState type="pyq" />
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Subject;