'use client';

/**
 * Login Page
 *
 * Displays Google OAuth and Vipps Login buttons for user authentication.
 * After successful authentication, users are redirected to the home page.
 *
 * UX:
 * - Centered card layout with KI MUSIKK branding
 * - "Logg inn med Vipps" button (primary, Vipps orange)
 * - "Logg inn med Google" button (secondary)
 * - Loading states during OAuth redirects
 *
 * Flow:
 * 1. User clicks login button (Vipps or Google)
 * 2. Redirected to OAuth consent screen
 * 3. After granting permission, redirected to respective callback
 * 4. Callback handler creates session and redirects to home page
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function LoginContent() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVippsLoading, setIsVippsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Check for error from callback
  const errorParam = searchParams.get('error');
  const errorMessage = errorParam ? getErrorMessage(errorParam) : null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        setError(error.message || 'Failed to sign in with Google');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError('En uventet feil oppstod. Prøv igjen.');
      setIsGoogleLoading(false);
    }
  };

  const handleVippsSignIn = () => {
    setIsVippsLoading(true);
    setError(null);
    // Redirect to Vipps OAuth initiation route
    window.location.href = '/api/auth/vipps';
  };

  const displayError = error || errorMessage;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold text-white">
            Velkommen til KI MUSIKK
          </CardTitle>
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E94560]/10 to-[#FFC93C]/10 border border-[#E94560]/20 rounded-full px-4 py-2">
            <span className="text-2xl">🎁</span>
            <span className="text-base font-semibold text-[#E94560]">5 gratis sanger ved registrering!</span>
          </div>
          <CardDescription className="text-base">
            Lag norske sanger med KI – helt gratis å prøve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{displayError}</p>
            </div>
          )}

          {/* Vipps Login Button - Primary */}
          <Button
            onClick={handleVippsSignIn}
            disabled={isVippsLoading || isGoogleLoading}
            className="w-full h-12 text-base font-medium bg-[#FF5B24] hover:bg-[#E54D1C] text-white"
          >
            {isVippsLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Kobler til Vipps...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                  <path d="M8 9l2.5 4L8 17h2l2.5-4L10 9H8zm5 0l2.5 4L13 17h2l2.5-4L15 9h-2z" fill="currentColor" />
                </svg>
                Logg inn med Vipps
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-gray-400">eller</span>
            </div>
          </div>

          {/* Google Login Button - Secondary */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isVippsLoading}
            variant="outline"
            className="w-full h-12 text-base font-medium"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Kobler til Google...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Logg inn med Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-400 mt-4">
            Ved å logge inn godtar du våre vilkår og personvernregler
          </p>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Lagd av <strong className="text-white">Grøftefyll</strong></span>
            </div>
            <p className="text-xs text-center text-gray-400 mt-1">
              Norsk AI-artist med 80.000+ månedlige lyttere på Spotify
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'vipps_denied':
      return 'Vipps-innlogging ble avbrutt. Prøv igjen.';
    case 'invalid_callback':
    case 'invalid_state':
      return 'Ugyldig påloggingsforespørsel. Prøv igjen.';
    case 'token_exchange':
    case 'userinfo':
      return 'Kunne ikke hente brukerinformasjon fra Vipps. Prøv igjen.';
    case 'no_email':
      return 'Vipps-kontoen din mangler e-postadresse.';
    case 'create_user':
    case 'session':
      return 'Kunne ikke opprette bruker. Prøv igjen.';
    case 'config':
      return 'Systemfeil. Kontakt support.';
    case 'vipps_init':
    case 'callback':
    default:
      return 'Noe gikk galt. Prøv igjen.';
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Laster...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
