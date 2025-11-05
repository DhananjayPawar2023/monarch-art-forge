import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithWallet: (address: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  connectWallet: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setUserRole(data.role);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Welcome to Monarch Gallery",
      });
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    navigate('/');
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const signInWithWallet = async (address: string) => {
    try {
      // Check if profile with this wallet exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('wallet_address', address)
        .single();

      if (profile) {
        // Sign in with magic link if profile exists
        const { error } = await supabase.auth.signInWithOtp({
          email: profile.email!,
          options: {
            shouldCreateUser: false
          }
        });

        if (error) throw error;

        toast({
          title: "Check your email",
          description: "We've sent you a login link",
        });
        
        return { error: null };
      } else {
        // Create new account with wallet
        const email = `${address.toLowerCase()}@wallet.monarch`;
        const password = `wallet_${address}_${Date.now()}`;

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: `User ${address.slice(0, 6)}`,
              wallet_address: address
            }
          }
        });

        if (signUpError) throw signUpError;

        // Update profile with wallet address
        await supabase
          .from('profiles')
          .update({ wallet_address: address })
          .eq('email', email);

        toast({
          title: "Account created!",
          description: "Your wallet has been connected successfully",
        });

        return { error: null };
      }
    } catch (error: any) {
      return { error };
    }
  };

  const connectWallet = async (address: string) => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ wallet_address: address })
      .eq('id', user.id);

    toast({
      title: "Wallet connected!",
      description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  const value = {
    user,
    session,
    userRole,
    isAdmin: userRole === 'admin',
    loading,
    signUp,
    signIn,
    signInWithWallet,
    signOut,
    connectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
