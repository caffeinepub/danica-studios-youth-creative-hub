import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mic, Camera, Radio, AlertCircle } from 'lucide-react';
import { getRoleClaimError, clearRoleClaimError } from '../../utils/pendingRoleRequest';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const [claimError, setClaimError] = useState<string | null>(null);

  // Check for role claim errors on mount
  useEffect(() => {
    const error = getRoleClaimError();
    if (error) {
      setClaimError(error);
      clearRoleClaimError();
    }
  }, []);

  const handleLogin = async () => {
    try {
      // Clear any previous errors
      setClaimError(null);

      // Trigger Internet Identity login
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-[oklch(0.646_0.222_41.116)] to-[oklch(0.6_0.118_184.704)] shadow-lg">
              <span className="text-white font-bold text-3xl">DS</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">Danica Studios Youth Creative Hub</h1>
          <p className="text-xl text-muted-foreground">A signature of Excellence</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-[oklch(0.646_0.222_41.116)]" />
                Recording Studio
              </CardTitle>
              <CardDescription>
                Professional recording sessions for artists and musicians
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-[oklch(0.6_0.118_184.704)]" />
                Podcast Studio
              </CardTitle>
              <CardDescription>
                State-of-the-art podcast recording with acoustic treatment
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[oklch(0.769_0.188_70.08)]" />
                Photo/Video Studio
              </CardTitle>
              <CardDescription>
                Professional photography and videography services
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to Danica Studios</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to access the studio management system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {claimError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{claimError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="w-full gap-2"
              size="lg"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
