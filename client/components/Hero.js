
import { useState, useEffect } from 'react';
import Button from './Button';
import { Sparkles, ArrowRight, ChevronRight, Shield, Clock, Star } from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f2b2f]">
      {/* Animated background gradients and floating dots */}
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

      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>

        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-[#73cfd0] font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Legal Excellence
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
          <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
            Your Legal Assistant,
          </span>
          <span className="block bg-gradient-to-r from-[#73cfd0] via-[#5abdc4] to-[#4aa9b8] bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 font-medium mb-12 leading-relaxed">
          Get instant, professional mitigation statements and legal support—AI-powered, 
          <span className="text-[#73cfd0] font-semibold"> affordable</span>, and reviewed by 
          <span className="text-[#73cfd0] font-semibold"> real solicitors</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Button href="/chat" size="lg" className="w-full sm:w-auto group">
            Start Your Statement
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button href="/services" size="lg" variant="secondary" className="w-full sm:w-auto">
            Explore Services
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#73cfd0]" />
            <span>Solicitor Reviewed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#73cfd0]" />
            <span>24-Hour Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#73cfd0]" />
            <span>5-Star Rated</span>
          </div>
        </div>
      </div>
    </section>
  );
}