import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Custom404() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | StreetLegal-AI</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f] px-4">      {/* Animated background gradients and floating dots */}
        <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#73cfd0]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 bg-[#73cfd0]/30 rounded-full animate-float"
                style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
                }}
            ></div>
            ))}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg%20width%3d%2260%22%20height%3d%2260%22%20viewBox%3d%220%200%2060%2060%22%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%3e%3cg%20fill%3d%22none%22%20fill-rule%3d%22evenodd%22%3e%3cg%20fill%3d%22%2373cfd0%22%20fill-opacity%3d%220.05%22%3e%3ccircle%20cx%3d%2230%22%20cy%3d%2230%22%20r%3d%221%22/%3e%3c/g%3e%3c/g%3e%3c/svg%3e')] opacity-40"></div>
        </div>
        <div ref={containerRef} className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#73cfd0]/20 p-10 sm:p-16 animate-fade-in">
          <div className="text-7xl font-black text-[#73cfd0] mb-4 drop-shadow-lg">404</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Page Not Found</h1>
          <p className="text-lg text-[#73cfd0]/80 mb-8 text-center max-w-md">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="px-6 py-3 bg-[#73cfd0] text-black rounded-xl font-semibold shadow hover:bg-white hover:text-[#0f2b2f] transition-all duration-300">
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
