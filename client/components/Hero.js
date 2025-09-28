import Button from './Button'

export default function Hero() {
  return (
    <section className="relative bg-[#0f2b2fcc] overflow-hidden">
      {/* Subtle background SVG/shape */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#73cfd0" fillOpacity="0.12" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
        </svg>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          <span className="block">Your Legal Assistant,</span>
          <span className="block text-[#73cfd0]">Powered by AI</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-white font-medium">
          Get instant, professional mitigation statements and legal support—AI-powered, affordable, and reviewed by real solicitors.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4">
          <Button href="/chat" size="lg" className="w-full sm:w-auto bg-[#73cfd0] text-black font-semibold shadow-lg hover:bg-[#0f2b2fcc] hover:text-white transition">
            Start Your Statement
          </Button>
          <Button href="/services" size="lg" className="w-full sm:w-auto bg-white border border-[#73cfd0] text-[#0f2b2fcc] font-semibold shadow hover:bg-[#73cfd0] hover:text-black transition">
            Explore Services
          </Button>
        </div>
      </div>
    </section>
  )
}