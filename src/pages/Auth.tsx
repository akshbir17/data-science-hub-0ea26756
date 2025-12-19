import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, ShieldCheck, BookOpen, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const usnSchema = z.string().min(10, 'USN must be at least 10 characters').max(15, 'USN must be at most 15 characters');

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Student form
  const [studentUSN, setStudentUSN] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  
  // Admin form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate USN
      const usnResult = usnSchema.safeParse(studentUSN);
      if (!usnResult.success) {
        toast({ title: 'Validation Error', description: usnResult.error.errors[0].message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const passwordResult = passwordSchema.safeParse(studentPassword);
      if (!passwordResult.success) {
        toast({ title: 'Validation Error', description: passwordResult.error.errors[0].message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Use USN as email format for students
      const email = `${studentUSN.toLowerCase()}@student.portal`;

      if (isLogin) {
        const { error } = await signIn(email, studentPassword);
        if (error) {
          toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, studentPassword, {
          full_name: studentName,
          usn: studentUSN.toUpperCase(),
          role: 'student',
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: 'Account Exists', description: 'This USN is already registered. Please login instead.', variant: 'destructive' });
          } else {
            toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Registration Successful', description: 'Welcome to the portal!' });
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailResult = emailSchema.safeParse(adminEmail);
      if (!emailResult.success) {
        toast({ title: 'Validation Error', description: emailResult.error.errors[0].message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const passwordResult = passwordSchema.safeParse(adminPassword);
      if (!passwordResult.success) {
        toast({ title: 'Validation Error', description: passwordResult.error.errors[0].message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(adminEmail, adminPassword);
        if (error) {
          toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome back!', description: 'Successfully logged in as admin.' });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(adminEmail, adminPassword, {
          full_name: adminName,
          role: 'admin',
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: 'Account Exists', description: 'This email is already registered. Please login instead.', variant: 'destructive' });
          } else {
            toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Registration Successful', description: 'Admin account created!' });
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-cyan-400 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent shadow-glow mb-4">
            <BookOpen className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Data Science Department</h1>
          <p className="text-primary-foreground/70 mt-1">Resource Portal</p>
        </div>

        <Card className="shadow-xl border-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? 'Sign in to access your resources' : 'Register to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'admin')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Full Name</Label>
                      <Input
                        id="studentName"
                        placeholder="Enter your full name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="usn">University Seat Number (USN)</Label>
                    <Input
                      id="usn"
                      placeholder="e.g., 1DS22DS001"
                      value={studentUSN}
                      onChange={(e) => setStudentUSN(e.target.value.toUpperCase())}
                      required
                      className="uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPassword">Password</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Full Name</Label>
                      <Input
                        id="adminName"
                        placeholder="Enter your full name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@university.edu"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="font-medium text-primary">{isLogin ? 'Sign up' : 'Sign in'}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
