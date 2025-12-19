import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  Loader2,
  FolderOpen
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
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch resources
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
          <Button variant="outline" className="mt-4">
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
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
              <Badge variant="secondary">{subject.code}</Badge>
            </div>
            <p className="text-muted-foreground">{subject.description}</p>
          </div>
          <Badge className="w-fit bg-primary/10 text-primary border-0">
            {subject.semester} Semester
          </Badge>
        </div>
      </div>

      {/* Resources List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Study Materials ({resources.length})
          </h2>
        </div>

        {resources.length > 0 ? (
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <Card 
                key={resource.id} 
                className="group hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary shrink-0">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
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

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(resource)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(resource)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed border-2 bg-muted/30">
            <FolderOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No Resources Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Study materials for this subject haven't been uploaded yet. 
              Check back later or contact your administrator.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Subject;
