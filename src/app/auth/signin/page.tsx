'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff, Stethoscope } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 SignIn: Attempting sign in with:', email);
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Handle redirect manually to implement role-based routing
      });

      console.log('🔄 SignIn: Sign in result:', result);

      if (result?.error) {
        console.log('❌ SignIn: Sign in failed:', result.error);
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('✅ SignIn: Sign in successful, determining redirect...');
        
        // Fetch the session to get user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.role) {
          console.log('🎯 SignIn: User role detected:', session.user.role);
          
          // Direct role-based redirection
          let redirectUrl = '/dashboard'; // fallback
          
          switch (session.user.role) {
            case 'staff':
            case 'practitioner':
              redirectUrl = '/staff/dashboard';
              break;
            case 'admin':
              redirectUrl = '/admin/dashboard';
              break;
            case 'patient':
              redirectUrl = '/patient/dashboard';
              break;
            default:
              redirectUrl = '/dashboard';
              break;
          }
          
          console.log('🚀 SignIn: Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.log('⚠️ SignIn: No role found, using default redirect');
          window.location.href = '/dashboard';
        }
        return;
      }
    } catch (error) {
      console.error('💥 SignIn: Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your Sydney Med dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your staff email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

           
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      
      {/* Loading Overlay during Authentication */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="text-sm text-gray-600">Please wait while we authenticate your credentials</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
