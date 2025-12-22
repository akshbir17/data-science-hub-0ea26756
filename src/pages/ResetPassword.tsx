import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2, Lock, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL for error
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorDescription = hashParams.get('error_description');
      
      if (errorDescription) {
        setError(errorDescription);
        return;
      }
      
      if (!session) {
        // No session means the link is invalid or expired
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast({ 
          title: 'Validation Error', 
          description: passwordResult.error.errors[0].message, 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }

      // Check passwords match
      if (password !== confirmPassword) {
        toast({ 
          title: 'Passwords do not match', 
          description: 'Please make sure both passwords are the same.', 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }

      // Update the password with timeout
      const updatePromise = supabase.auth.updateUser({
        password: password
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000)
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as { error: Error | null };

      if (error) {
        toast({ 
          title: 'Error', 
          description: error.message, 
          variant: 'destructive' 
        });
      } else {
        setSuccess(true);
        toast({ 
          title: 'Password Updated', 
          description: 'Your password has been successfully changed.' 
        });
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred.', 
        variant: 'destructive' 
      });
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
            <CardTitle className="text-xl font-semibold text-center text-foreground flex items-center justify-center gap-2">
              {success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Password Updated
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {success 
                ? 'Redirecting you to the dashboard...' 
                : error 
                  ? error 
                  : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full gradient-purple text-primary-foreground rounded-xl py-6"
                >
                  Go to Login
                </Button>
              </div>
            ) : success ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input border-border/50 rounded-xl focus:border-primary"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input border-border/50 rounded-xl focus:border-primary"
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-purple text-primary-foreground rounded-xl py-6 hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
