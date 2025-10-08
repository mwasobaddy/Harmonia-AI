import { useRef } from 'react';
import { Layout, Footer } from '../components';


export default function About() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const commitmentRef = useRef(null);

  const commitments = [
    {
      text: "Professional quality documents reviewed by qualified solicitors",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    },
    {
      text: "Transparent pricing with no hidden fees",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    },
    {
      text: "Secure, confidential service protecting your privacy",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    },
    {
      text: "Fast turnaround times to meet court deadlines",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      text: "Specialized expertise across different types of legal matters",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    }
  ];


  return (
    <Layout
      title="About Us - StreetLegal-AI"
      description="Learn about our mission to provide affordable legal mitigation services powered by AI"
    >
      <div className="bg-gradient-to-br from-[#0f2b2f] via-[#1a2332] to-[#0f2b2f]">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#73cfd0]/10 to-transparent"></div>
          <div ref={heroRef} className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#73cfd0]/10 border border-[#73cfd0]/20 text-sm text-[#73cfd0] font-medium mb-8 backdrop-blur-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                About Us
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                About <span className="text-[#73cfd0]">StreetLegal-AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Democratizing access to professional legal mitigation services
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-24 bg-gradient-to-b from-transparent to-[#0f2b2f]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={contentRef} className="max-w-4xl mx-auto space-y-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <p className="text-gray-300 text-xl leading-relaxed">
                  StreetLegal-AI was founded with a simple mission: to make professional legal mitigation
                  services accessible to everyone, regardless of their budget. We understand that facing
                  legal proceedings can be stressful and expensive, which is why we've leveraged cutting-edge
                  AI technology to provide high-quality mitigation statements at a fraction of traditional costs.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <p className="text-gray-300 text-xl leading-relaxed">
                  Our platform combines the expertise of qualified solicitors with advanced AI language models
                  to generate comprehensive, legally-sound mitigation statements. Every document is reviewed
                  by experienced legal professionals before delivery, ensuring the highest standards of quality
                  and accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Section */}
        <div className="py-24 bg-gradient-to-b from-[#0f2b2f]/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Our Commitment
              </h2>
              <p className="text-xl text-[#73cfd0] max-w-2xl mx-auto">
                What sets us apart in legal mitigation services
              </p>
            </div>

            <div ref={commitmentRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {commitments.map((commitment, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#73cfd0]/20 text-[#73cfd0] group-hover:bg-[#73cfd0] group-hover:text-black transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d={commitment.icon}></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-1 bg-gradient-to-r from-[#73cfd0] to-transparent rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {commitment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}