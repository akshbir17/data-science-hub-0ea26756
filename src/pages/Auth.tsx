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

// Common vulgar/inappropriate words filter
const vulgarWords = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'dick', 'cock', 'pussy', 
  'bastard', 'slut', 'whore', 'cunt', 'piss', 'fag', 'nigger', 'nigga',
  'retard', 'idiot', 'stupid', 'dumb', 'hate', 'kill', 'die', 'sex',
  'porn', 'nude', 'naked', 'penis', 'vagina', 'boob', 'tit', 'arse'
];

const containsVulgarWord = (text: string): boolean => {
  const lowerText = text.toLowerCase().replace(/[^a-z]/g, '');
  return vulgarWords.some(word => lowerText.includes(word));
};

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be at most 50 characters')
  .refine(
    (name) => !containsVulgarWord(name),
    { message: 'Please use an appropriate name without vulgar language' }
  );

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

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset to login when switching to admin tab
  useEffect(() => {
    if (activeTab === 'admin') {
      setIsLogin(true);
    }
  }, [activeTab]);

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
        // Validate name for signup
        if (!isLogin) {
          const nameResult = nameSchema.safeParse(studentName);
          if (!nameResult.success) {
            toast({ title: 'Validation Error', description: nameResult.error.errors[0].message, variant: 'destructive' });
            setLoading(false);
            return;
          }
        }

        const { error } = await signUp(email, studentPassword, {
          full_name: studentName.trim(),
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

      // Admin can only login, no signup
      const { error } = await signIn(adminEmail, adminPassword);
      if (error) {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome back!', description: 'Successfully logged in as admin.' });
        navigate('/dashboard');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-glow" />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-purple shadow-glow mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">Data Science Department</h1>
          <p className="text-muted-foreground mt-1">Resource Portal</p>
        </div>

        <Card className="glass-card border-0 shadow-purple animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-foreground">
              {activeTab === 'admin' ? 'Admin Login' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {activeTab === 'admin' 
                ? 'Sign in with your admin credentials' 
                : (isLogin ? 'Sign in to access your resources' : 'Register to get started')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'admin')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="student" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="studentName" className="text-foreground">Full Name</Label>
                      <Input
                        id="studentName"
                        placeholder="Enter your full name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required={!isLogin}
                        className="bg-input border-border/50 rounded-xl focus:border-primary"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="usn" className="text-foreground">University Seat Number (USN)</Label>
                    <Input
                      id="usn"
                      placeholder="e.g., 1DS22DS001"
                      value={studentUSN}
                      onChange={(e) => setStudentUSN(e.target.value.toUpperCase())}
                      required
                      className="bg-input border-border/50 rounded-xl uppercase focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPassword" className="text-foreground">Password</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                      className="bg-input border-border/50 rounded-xl focus:border-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-purple rounded-xl shadow-glow-sm hover:shadow-glow transition-all" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-foreground">Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@university.edu"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="bg-input border-border/50 rounded-xl focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-foreground">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="bg-input border-border/50 rounded-xl focus:border-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-purple rounded-xl shadow-glow-sm hover:shadow-glow transition-all" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Only show signup toggle for students */}
            {activeTab === 'student' && (
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
            )}
          </CardContent>
        </Card>

        {/* Credit line */}
        <p className="text-center text-muted-foreground/60 text-sm mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          made by Akshbir Singh Seehra
        </p>
      </div>
    </div>
  );
};

export default Auth;