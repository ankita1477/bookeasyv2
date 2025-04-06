import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  signInWithGoogle, 
  logInWithEmailAndPassword, 
  registerWithEmailAndPassword, 
  resetPassword,
  auth
} from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, UserPlus, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface LocationState {
  userType: string;
}

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [userType, setUserType] = useState<string>('customer');

  // Extract user type from location state
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.userType) {
      setUserType(state.userType);
    }
  }, [location]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (loading) return;
    if (user) {
      const redirectPage = userType === 'business' ? '/business-dashboard' : '/user-home';
      navigate(redirectPage);
    }
  }, [user, loading, navigate, userType]);

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle(userType);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (authMode === 'login') {
        await logInWithEmailAndPassword(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await registerWithEmailAndPassword(email, password, userType);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to send password reset email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bookeasy-light">
      {/* Include the Navbar but with a special AuthNavbar class for spacing */}
      <Navbar />
      
      {/* Main content with proper top padding to avoid navbar overlap */}
      <div className="flex-1 flex items-center justify-center p-6 mt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Button
              variant="ghost"
              className="mb-6 pl-0 text-gray-500 hover:text-bookeasy-purple hover:bg-transparent"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Home
            </Button>
            
            <div className="text-center mb-8">
              <h1 className={cn(
                "text-3xl font-bold mb-2",
                userType === 'business' ? "text-bookeasy-orange" : "text-bookeasy-purple"
              )}>
                {userType === 'business' ? 'Business Portal' : 'Customer Login'}
              </h1>
              <p className="text-gray-600">
                {userType === 'business' 
                  ? 'List your space and manage bookings' 
                  : 'Find and book awesome spaces'}
              </p>
            </div>
            
            {/* Google Sign In Button */}
            <Button 
              className={cn(
                "w-full mb-6 relative",
                isLoading ? "pointer-events-none" : "",
                userType === 'business' 
                  ? "bg-bookeasy-orange hover:bg-bookeasy-orange/90" 
                  : "bg-bookeasy-purple hover:bg-bookeasy-purple/90"
              )}
              onClick={handleSignInWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                OR
              </span>
            </div>
            
            <Tabs defaultValue="login" onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-1">
                  <LogIn size={16} />
                  <span>Login</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1">
                  <UserPlus size={16} />
                  <span>Register</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                {/* Error Message */}
                {errorMessage && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                {/* Password Reset Confirmation */}
                {resetSent && (
                  <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Password reset link sent to your email!</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleEmailPasswordAuth}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 text-sm text-gray-500 hover:text-bookeasy-purple"
                      onClick={handlePasswordReset}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className={cn(
                        "w-full",
                        userType === 'business' 
                          ? "bg-bookeasy-orange hover:bg-bookeasy-orange/90" 
                          : "bg-bookeasy-purple hover:bg-bookeasy-purple/90"
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : "Login"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                {/* Error Message */}
                {errorMessage && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleEmailPasswordAuth}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className={cn(
                        "w-full",
                        userType === 'business' 
                          ? "bg-bookeasy-orange hover:bg-bookeasy-orange/90" 
                          : "bg-bookeasy-purple hover:bg-bookeasy-purple/90"
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : "Create Account"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Toggle User Type */}
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-2">
              {userType === 'customer' 
                ? 'Are you a business owner?' 
                : 'Looking to book a space?'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setUserType(userType === 'customer' ? 'business' : 'customer')}
              className={cn(
                "border-2",
                userType === 'customer' 
                  ? "border-bookeasy-orange text-bookeasy-orange hover:bg-bookeasy-orange/10" 
                  : "border-bookeasy-purple text-bookeasy-purple hover:bg-bookeasy-purple/10"
              )}
            >
              {userType === 'customer' 
                ? 'Switch to Business Login' 
                : 'Switch to Customer Login'}
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;