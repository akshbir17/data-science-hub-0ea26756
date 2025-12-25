import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Users, Search, AlertTriangle, Trash2 } from 'lucide-react';

interface UserWithRole {
  user_id: string;
  email: string | null;
  full_name: string | null;
  usn: string | null;
  role: 'student' | 'admin';
}

const AdminPanel = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [user, userRole, authLoading, navigate, toast]);

  // Fetch users with roles
  useEffect(() => {
    if (userRole !== 'admin') return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch profiles and user_roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, full_name, usn');

        if (profilesError) throw profilesError;

        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) throw rolesError;

        // Merge profiles with roles
        const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
          const userRoleData = roles?.find((r) => r.user_id === profile.user_id);
          return {
            user_id: profile.user_id,
            email: profile.email,
            full_name: profile.full_name,
            usn: profile.usn,
            role: (userRoleData?.role as 'student' | 'admin') || 'student',
          };
        });

        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userRole, toast]);

  const handleRoleChange = async (userId: string, newRole: 'student' | 'admin') => {
    if (userId === user?.id) {
      toast({
        title: 'Cannot modify own role',
        description: 'You cannot change your own role.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingUserId(userId);
    try {
      // Check if user_roles entry exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );

      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: 'Cannot delete yourself',
        description: 'You cannot delete your own account.',
        variant: 'destructive',
      });
      return;
    }

    setDeletingUserId(userId);
    try {
      // Delete from user_roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Delete from profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profilesError) throw profilesError;

      // Update local state
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));

      toast({
        title: 'User removed',
        description: 'User has been removed from the system.',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.full_name?.toLowerCase().includes(term) ||
      u.usn?.toLowerCase().includes(term)
    );
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const studentCount = users.filter((u) => u.role === 'student').length;

  if (authLoading || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{studentCount}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user roles</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">USN</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {u.full_name || 'Unknown'}
                          {u.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {u.email || '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {u.usn || '—'}
                      </TableCell>
                      <TableCell>
                        {u.user_id === user?.id ? (
                          <div className="flex items-center gap-2" title="Cannot change own role">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              admin
                            </Badge>
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(value: 'student' | 'admin') => handleRoleChange(u.user_id, value)}
                            disabled={updatingUserId === u.user_id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">student</SelectItem>
                              <SelectItem value="admin">admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.user_id === user?.id ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingUserId === u.user_id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove <strong>{u.full_name || u.email || 'this user'}</strong>? 
                                  This will delete their profile and role data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(u.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
