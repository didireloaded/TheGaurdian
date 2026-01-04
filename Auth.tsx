import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const authData = authMethod === 'email'
          ? { email, password }
          : { phone, password };

        const { error } = await supabase.auth.signUp({
          ...authData,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Welcome to SafeGuard!",
          description: "Your account has been created.",
        });

        navigate('/');
      } else {
        const authData = authMethod === 'email'
          ? { email, password }
          : { phone, password };

        const { error } = await supabase.auth.signInWithPassword(authData);

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });

        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen (Jövi style)
  if (showWelcome) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Hero Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=1600&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-between p-6 text-white">
          {/* Logo */}
          <div className="pt-4 text-center">
            <div className="inline-flex items-center gap-2">
              <Shield className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-wider">SafeGuard</span>
            </div>
          </div>

          {/* Hero Text */}
          <div className="text-center space-y-4 pb-8">
            <h1 className="text-5xl font-bold leading-tight">
              Your Safety,
              <br />
              Our Priority
            </h1>
            <p className="text-lg text-white/90">
              Emergency response at your fingertips
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 pb-8">
            <Button
              onClick={() => {
                setShowWelcome(false);
                setIsSignUp(true);
              }}
              className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 rounded-full"
            >
              Get started
            </Button>

            <Button
              onClick={() => {
                setShowWelcome(false);
                setIsSignUp(false);
              }}
              variant="ghost"
              className="w-full h-14 text-lg font-semibold text-white hover:bg-white/10 rounded-full"
            >
              I already have an account
            </Button>

            {/* Terms */}
            <p className="text-xs text-center text-white/70 px-4">
              By proceeding to use SafeGuard, you agree to our{' '}
              <span className="underline">terms of use</span> and acknowledge that you have read our{' '}
              <span className="underline">privacy policy</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Auth Method Selection (Open style)
  if (!authMethod) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=1600&fit=crop)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-between p-6 text-white">
          {/* Close Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="inline-flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="text-xl font-bold tracking-wider">SafeGuard</span>
            </div>
            <button
              onClick={() => setShowWelcome(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2 pb-12">
            <h1 className="text-4xl font-bold">
              {isSignUp ? 'Create Account' : 'Welcome back'}
            </h1>
            <p className="text-lg text-white/70">
              {isSignUp ? 'Join the SafeGuard community' : 'Sign in to continue your safety'}
            </p>
          </div>

          {/* Auth Method Buttons */}
          <div className="space-y-4 pb-8">
            <Button
              onClick={() => setAuthMethod('email')}
              className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 rounded-full flex items-center justify-center gap-3"
            >
              <Mail className="h-5 w-5" />
              Email sign in <ArrowRight className="h-5 w-5 ml-auto" />
            </Button>

            <Button
              onClick={() => setAuthMethod('phone')}
              variant="outline"
              className="w-full h-14 text-lg font-semibold bg-transparent text-white border-2 border-white hover:bg-white/10 rounded-full flex items-center justify-center gap-3"
            >
              <Phone className="h-5 w-5" />
              Phone sign in <ArrowRight className="h-5 w-5 ml-auto" />
            </Button>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
                <span className="underline font-semibold">
                  {isSignUp ? 'Sign in' : 'Sign up'} <ArrowRight className="inline h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth Form
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto pt-8">
        {/* Back Button */}
        <button
          onClick={() => setAuthMethod(null)}
          className="mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-emergency rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">SafeGuard</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? 'Create your account' : 'Sign in'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp
              ? `Enter your details to get started`
              : `Welcome back to SafeGuard`
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
          )}

          {authMethod === 'email' ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+264 81 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-gradient-emergency rounded-full"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignUp ? 'Create Account' : 'Sign In'
            }
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
