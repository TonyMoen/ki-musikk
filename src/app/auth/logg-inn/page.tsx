'use client';

/**
 * Login Page
 *
 * Displays Google OAuth and Vipps Login buttons for user authentication.
 * After successful authentication, users are redirected to the home page.
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

function LoginContent() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVippsLoading, setIsVippsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

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
    window.location.href = '/api/auth/vipps';
  };

  const displayError = error || errorMessage;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background waveform decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]"
          viewBox="0 0 400 400"
          fill="none"
        >
          {/* Concentric sound wave rings */}
          <circle cx="200" cy="200" r="60" stroke="#FF5B24" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="100" stroke="#FF5B24" strokeWidth="1" />
          <circle cx="200" cy="200" r="140" stroke="#FF5B24" strokeWidth="0.8" />
          <circle cx="200" cy="200" r="180" stroke="#FF5B24" strokeWidth="0.5" />
          {/* Waveform bars */}
          {[...Array(40)].map((_, i) => {
            const x = 20 + i * 9;
            const h = 15 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.3) * 20;
            return (
              <rect
                key={i}
                x={x}
                y={350 - h / 2}
                width="4"
                height={h}
                rx="2"
                fill="#FF5B24"
                opacity={0.6 + Math.sin(i * 0.4) * 0.4}
              />
            );
          })}
        </svg>
      </div>

      {/* Social proof - above the card */}
      <div className="flex flex-col items-center mb-6 relative z-10">
        <div className="flex items-center gap-2 text-sm text-[rgba(180,200,240,0.5)]">
          <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Lagd av <strong className="text-white">Grøftefyll</strong></span>
        </div>
        <p className="text-xs text-[rgba(130,170,240,0.45)] mt-1">
          Norsk AI-artist med 80.000+ månedlige lyttere på Spotify
        </p>
      </div>

      {/* Tagline */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Velkommen til KI MUSIKK
        </h1>
        <p className="text-[rgba(180,200,240,0.5)]">
          Lag norske sanger med KI – helt gratis å prøve
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-lg relative z-10">
        <CardContent className="p-6 space-y-5">
          {/* Free songs banner - info style with left accent */}
          <div className="flex items-center gap-3 bg-[rgba(242,101,34,0.06)] border-l-[3px] border-l-[#FF5B24] rounded-r-lg px-4 py-3">
            <Sparkles className="h-5 w-5 text-[#FF5B24] flex-shrink-0" />
            <span className="text-sm font-medium text-[rgba(180,200,240,0.7)]">
              <strong className="text-white">2 gratis sanger</strong> ved registrering
            </span>
          </div>

          {displayError && (
            <div className="bg-red-900/20 border border-red-800 rounded-md p-3">
              <p className="text-sm text-red-200">{displayError}</p>
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[rgba(90,140,255,0.15)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-[rgba(130,170,240,0.45)] font-medium">eller</span>
            </div>
          </div>

          {/* Google Login Button - with visible border */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isVippsLoading}
            variant="outline"
            className="w-full h-12 text-base font-medium border-[rgba(90,140,255,0.2)] bg-[rgba(20,40,80,0.35)] hover:bg-[rgba(40,80,160,0.2)] text-white"
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

          {/* Legal text with clickable links */}
          <p className="text-xs text-center text-[rgba(130,170,240,0.45)] pt-1">
            Ved å logge inn godtar du våre{' '}
            <Link href="/vilkar" className="text-[#FF5B24] hover:underline">
              vilkår
            </Link>{' '}
            og{' '}
            <Link href="/personvern" className="text-[#FF5B24] hover:underline">
              personvernregler
            </Link>
          </p>
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
      <div className="min-h-screen flex items-center justify-center p-4">
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
