
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Header, Footer, Button, LoadingSpinner } from '../components';
import toast from 'react-hot-toast';
import gsap from 'gsap';


export default function Login() {
  // --- State ---
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  // --- Animation Refs ---
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  // --- Animate in on mount ---
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, delay: 0.2, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  // --- Auth logic ---
  useEffect(() => {
    const { token, success: successParam, error: errorParam } = router.query;
    if (token) {
      localStorage.setItem('authToken', token);
      window.dispatchEvent(new Event('authChange'));
      toast.success('Successfully logged in! Redirecting...');
      setTimeout(() => {
        router.push('/chat');
      }, 2000);
    } else if (successParam === 'true') {
      toast.success('Login successful!');
    } else if (errorParam) {
      toast.error('Authentication failed. Please try again.');
    }
  }, [router.query, router]);

  // --- Google login handler ---
  const handleGoogleLogin = () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    toast('Redirecting to Google...');
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <>
      <Head>
        <title>Login - Harmonia-AI</title>
        <meta name="description" content="Login to your Harmonia-AI account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {/* Animated Card Container */}
          <div
            ref={cardRef}
            className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#73cfd0]/20 p-8 sm:p-10 flex flex-col items-center relative overflow-hidden"
          >
            {/* Floating Logo */}
            <div ref={logoRef} className="flex items-center justify-center mb-8">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="Harmonia-AI Logo" className="h-10 w-10 object-contain" />
              </div>
            </div>

            <h2 className="text-center text-3xl font-extrabold text-white mb-2 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-center text-base text-[#73cfd0]/80 mb-6">
              Secure access to your legal mitigation dashboard
            </p>

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              variant="primary"
              size="lg"
              className="w-full mb-4 flex items-center justify-center gap-2 bg-[#73cfd0] text-black hover:bg-white hover:text-[#0f2b2f] border-2 border-[#73cfd0] transition-all duration-300 shadow-lg hover:shadow-2xl"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-xs text-[#73cfd0]/80 text-center mb-2">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-[#73cfd0] hover:text-white underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#73cfd0] hover:text-white underline">
                Privacy Policy
              </Link>
            </p>

            <div className="mt-4 text-center">
              <p className="text-sm text-[#73cfd0]/80">
                Need help?{' '}
                <Link href="/contact" className="font-medium text-[#73cfd0] hover:text-white underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}