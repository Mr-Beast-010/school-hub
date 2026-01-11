import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Eye, EyeOff, GraduationCap, BookUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type SignUpRole = 'teacher' | 'student';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<SignUpRole>('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName, selectedRole);
      if (error) {
        toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Account Created!', description: 'You can now sign in.' });
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        navigate('/dashboard');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <School className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">EduManage</h1>
          <p className="text-lg text-primary-foreground/80">
            A complete school management system for administrators, teachers, and students.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <School className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">EduManage</h1>
              <p className="text-sm text-muted-foreground">School Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? 'Enter your details to create an account' : 'Please enter your credentials'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        selectedRole === 'teacher'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground'
                      )}
                    >
                      <BookUser className={cn(
                        'w-8 h-8',
                        selectedRole === 'teacher' ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'font-medium',
                        selectedRole === 'teacher' ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        Teacher
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        selectedRole === 'student'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground'
                      )}
                    >
                      <GraduationCap className={cn(
                        'w-8 h-8',
                        selectedRole === 'student' ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'font-medium',
                        selectedRole === 'student' ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        Student
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (isSignUp ? 'Creating...' : 'Signing in...') : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;