import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Wallet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp, signIn, signInWithWallet } = useAuth();
  const { toast } = useToast();
  const [formLoading, setFormLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/');
  }, [authLoading, user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      fullName: formData.get('fullName') as string,
    };

    try {
      const validated = signUpSchema.parse(data);
      const { error } = await signUp(validated.email, validated.password, validated.fullName);

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Sign up failed. Please try again.',
          variant: 'destructive',
        });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      const validated = signInSchema.parse(data);
      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Sign in failed. Please check your credentials.',
          variant: 'destructive',
        });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleWalletSignIn = async () => {
    const isEmbedded = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    if (isEmbedded) {
      toast({
        title: 'Wallet not available here',
        description: 'Wallet extensions usually do not work inside embedded previews. Open the app in a new tab to use MetaMask.',
        variant: 'destructive',
      });
      return;
    }

    if (!window.ethereum) {
      toast({
        title: 'MetaMask not found',
        description: 'Please install MetaMask (or enable it for this site) to connect with your wallet.',
        variant: 'destructive',
      });
      return;
    }

    setWalletLoading(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];
      const { error } = await signInWithWallet(address);

      // NOTE: current implementation sends an email OTP/magic link.
      // We'll replace this with real Sign-In With Ethereum (signature-based) next.
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Wallet sign-in failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error?.message || 'Failed to connect wallet.',
        variant: 'destructive',
      });
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-serif text-center sm:text-left">Welcome to Monarch Gallery</CardTitle>
          <CardDescription className="text-sm text-center sm:text-left">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="mb-6">
            <Button 
              onClick={handleWalletSignIn} 
              disabled={walletLoading}
              variant="outline"
              className="w-full gap-2 h-10 sm:h-11 text-sm"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              {walletLoading ? 'Connecting...' : 'Connect with Wallet'}
            </Button>
            <div className="relative my-5 sm:my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground whitespace-nowrap">
                Or continue with email
              </span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
              <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signin-email" className="text-sm">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signin-password" className="text-sm">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    className="h-10 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full h-10 sm:h-11 text-sm" disabled={formLoading}>
                  {formLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signup-email" className="text-sm">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signup-password" className="text-sm">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    className="h-10 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full h-10 sm:h-11 text-sm" disabled={formLoading}>
                  {formLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
