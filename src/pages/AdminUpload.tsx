import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
}

const AdminUpload = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [semester, setSemester] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!authLoading && userRole !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can access this page.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [userRole, authLoading, navigate, toast]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(s => !semester || s.semester === semester);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF or Word document.',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Maximum file size is 50MB.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !subjectId || !title.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${subjectId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create resource record
      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          subject_id: subjectId,
          uploaded_by: user?.id,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Upload Successful',
        description: 'Resource has been uploaded and is now available to students.',
      });

      // Reset form
      setSemester('');
      setSubjectId('');
      setTitle('');
      setDescription('');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Only administrators can access this page.</p>
        <Link to="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-2xl font-bold text-foreground">Upload Resources</h1>
        <p className="text-muted-foreground mt-1">
          Add study materials for students to access
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            New Resource
          </CardTitle>
          <CardDescription>
            Upload PDFs or Word documents for students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Semester Selection */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select value={semester} onValueChange={(value) => { setSemester(value); setSubjectId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3rd">3rd Semester</SelectItem>
                  <SelectItem value="4th">4th Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={!semester}>
                <SelectTrigger>
                  <SelectValue placeholder={semester ? "Select subject" : "Select semester first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                  {filteredSubjects.length === 0 && semester && (
                    <SelectItem value="none" disabled>
                      No subjects for this semester
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Module 1 - Introduction to Data Structures"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-foreground font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF or Word document (max 50MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpload;
