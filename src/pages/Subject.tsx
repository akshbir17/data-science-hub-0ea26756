import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  Loader2,
  FolderOpen,
  BookOpen,
  ClipboardList,
  Pencil,
  Trash2,
  ExternalLink,
  Star
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useOfflineCache, invalidateCache } from '@/hooks/useOfflineCache';

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
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetcher for subject and resources
  const fetchSubjectData = useCallback(async () => {
    if (!id) throw new Error('No subject ID');

    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (subjectError) throw subjectError;

    const { data: resourcesData, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .eq('subject_id', id)
      .order('created_at', { ascending: false });

    if (resourcesError) throw resourcesError;

    return {
      subject: subjectData as Subject,
      resources: (resourcesData || []) as Resource[]
    };
  }, [id]);

  // Use offline cache with stale-while-revalidate
  const { data: cachedData, loading, refresh } = useOfflineCache(
    `subject_${id}`,
    fetchSubjectData,
    { ttl: 1000 * 60 * 30, enabled: !!id } // 30 minutes TTL
  );

  const subject = cachedData?.subject || null;
  const [resources, setResources] = useState<Resource[]>([]);

  // Sync resources from cache when it updates
  useEffect(() => {
    if (cachedData?.resources) {
      setResources(cachedData.resources);
    }
  }, [cachedData]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdminRole();
  }, [user]);

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const url = getFileUrl(resource.file_path);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resource.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      const url = getFileUrl(resource.file_path);
      window.open(url, '_blank');
    }
  };

  const handleView = (resource: Resource) => {
    const url = getFileUrl(resource.file_path);
    window.open(url, '_blank');
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setEditTitle(resource.title);
    setEditDescription(resource.description || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingResource || !editTitle.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('resources')
        .update({ 
          title: editTitle.trim(),
          description: editDescription.trim() || null
        })
        .eq('id', editingResource.id);

      if (error) throw error;

      setResources(prev => 
        prev.map(r => 
          r.id === editingResource.id 
            ? { ...r, title: editTitle.trim(), description: editDescription.trim() || null }
            : r
        )
      );
      toast.success('Resource updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (resource: Resource) => {
    setDeletingResource(resource);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource) return;
    
    setDeleting(true);
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([deletingResource.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('resources')
        .delete()
        .eq('id', deletingResource.id);

      if (dbError) throw dbError;

      setResources(prev => prev.filter(r => r.id !== deletingResource.id));
      // Invalidate caches so next visit gets fresh data
      invalidateCache(`subject_${id}`);
      invalidateCache('dashboard_subjects');
      toast.success('Resource deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Sort resources by extracting module/unit numbers for proper ordering
  const extractNumber = (title: string): number => {
    const match = title.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  const sortByTitle = (a: Resource, b: Resource) => {
    const numA = extractNumber(a.title);
    const numB = extractNumber(b.title);
    if (numA !== numB) return numA - numB;
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
  };

  const materials = resources.filter(r => r.resource_type === 'material').sort(sortByTitle);
  const pyqs = resources.filter(r => r.resource_type === 'pyq').sort(sortByTitle);
  const importantNotes = resources.filter(r => r.resource_type === 'important').sort(sortByTitle);

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
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(resource)}
                  className="gap-2 rounded-xl"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(resource)}
                  className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
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

  const EmptyState = ({ type }: { type: 'material' | 'pyq' | 'important' }) => (
    <div className="p-12 text-center rounded-3xl border-2 border-dashed border-border bg-secondary/20">
      <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="font-semibold text-foreground mb-2">
        No {type === 'pyq' ? 'Past Year Questions' : type === 'important' ? 'Important Notes' : 'Study Materials'} Yet
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        {type === 'pyq' 
          ? 'Past year question papers will be uploaded soon. Check back later!'
          : type === 'important'
          ? 'Important notes and external resources will be uploaded soon. Check back later!'
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
          <div className="flex items-center gap-3">
            {subject.code === 'BCS302' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 hover:border-orange-500/50 text-orange-600 dark:text-orange-400"
                onClick={() => window.open('https://notebooklm.google.com/notebook/14db72fc-a8e2-4690-8f32-0aafee30ef3e', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                NotebookLM
              </Button>
            )}
            <Badge className="w-fit bg-primary/10 text-primary border-0 rounded-lg">
              {subject.semester} Semester
            </Badge>
          </div>
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
          <TabsTrigger
            value="important"
            className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-apple-sm gap-2 px-4"
          >
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Important Notes</span>
            <span className="sm:hidden">Important</span>
            {importantNotes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs rounded-md">
                {importantNotes.length}
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

        <TabsContent value="important" className="space-y-4 animate-fade-in">
          {importantNotes.length > 0 ? (
            importantNotes.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} />
            ))
          ) : (
            <EmptyState type="important" />
          )}
        </TabsContent>

      </Tabs>

      {/* Edit Resource Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g., Module 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingResource?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subject;