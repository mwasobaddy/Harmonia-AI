import { useRef } from 'react';
import { Button, Footer } from '../../components';
import AdminLayout from "../../components/admin/AdminLayout";


export default function HowItWorks() {
  const heroRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const steps = [
    {
      number: 1,
      title: "Choose Your Service",
      description: "Select the type of offense from our four categories: Driving Offenses, TV Licensing, Professional Regulation, or Minor Criminal Offenses. Each category has specialized questions tailored to your specific situation.",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" // Check circle
    },
    {
      number: 2,
      title: "Complete the Questionnaire",
      description: "Answer our guided questions in a conversational chat interface. We ask about your work, the situation, personal circumstances, and mitigation factors. The process takes about 15 minutes and can be saved and resumed anytime.",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" // Chat bubble
    },
    {
      number: 3,
      title: "AI Statement Generation",
      description: "Our Claude AI analyzes your responses and generates a professional mitigation statement. The AI draws from extensive legal knowledge and case law precedents to create a compelling, legally-sound document.",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" // AI/Robot
    },
    {
      number: 4,
      title: "Legal Review & Approval",
      description: "Every statement is reviewed and approved by a qualified solicitor before delivery. This ensures the highest standards of legal accuracy and professional quality.",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" // Shield check
    },
    {
      number: 5,
      title: "Secure Delivery",
      description: "Receive your professionally reviewed mitigation statement via secure download. The document is formatted for court or tribunal submission and ready to present.",
      icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" // Download
    }
  ];

  const features = [
    {
      title: "Expert Legal Knowledge",
      description: "Our AI is trained on extensive UK legal precedents and sentencing guidelines.",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    },
    {
      title: "Personalized Approach",
      description: "Each statement is tailored to your specific circumstances and situation.",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    },
    {
      title: "Professional Review",
      description: "All documents are reviewed by qualified legal professionals.",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    },
    {
      title: "Secure & Confidential",
      description: "Your information is protected with enterprise-grade security.",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    },
    {
      title: "Fast Turnaround",
      description: "From completion to delivery in as little as 3 business days.",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      title: "Court-Ready Format",
      description: "Documents formatted professionally for immediate submission.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    }
  ];


  return (
    <AdminLayout title="Admin - Info" description="Admin info for Harmonia-AI platform">
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
                How It Works
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                How Our Process <span className="text-[#73cfd0]">Works</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                From consultation to delivery, we guide you through every step of creating
                your professional mitigation statement using AI and legal expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="py-24 bg-gradient-to-b from-transparent to-[#0f2b2f]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Our 5-Step Process
              </h2>
              <p className="text-xl text-[#73cfd0] max-w-2xl mx-auto">
                A streamlined process designed to get you the best possible outcome
              </p>
            </div>

            <div ref={stepsRef} className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group">
                  <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                    <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] text-black text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d={step.icon}></path>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#73cfd0] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-24 bg-gradient-to-b from-[#0f2b2f]/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Why Choose Our Service
              </h2>
              <p className="text-xl text-[#73cfd0] max-w-2xl mx-auto">
                Professional quality with the convenience of modern technology
              </p>
            </div>

            <div ref={featuresRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#73cfd0]/20 text-[#73cfd0] group-hover:bg-[#73cfd0] group-hover:text-black transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d={feature.icon}></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#73cfd0] transition-colors duration-300">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24 bg-gradient-to-b from-transparent to-[#0f2b2f]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div ref={faqRef} className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-[#73cfd0] transition-colors duration-300">
                  <svg className="w-6 h-6 mr-3 text-[#73cfd0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  How long does the process take?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  The questionnaire takes about 15 minutes to complete. Once submitted, you'll receive your reviewed statement within 3 business days.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-[#73cfd0] transition-colors duration-300">
                  <svg className="w-6 h-6 mr-3 text-[#73cfd0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Is my information secure?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Yes, we use enterprise-grade encryption and security measures. Your personal information is never stored permanently and is deleted after processing.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-[#73cfd0] transition-colors duration-300">
                  <svg className="w-6 h-6 mr-3 text-[#73cfd0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  Can I save and resume later?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Absolutely! Your progress is automatically saved as you go through the questionnaire. You can return anytime to continue where you left off.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-[#73cfd0] transition-colors duration-300">
                  <svg className="w-6 h-6 mr-3 text-[#73cfd0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  What if I need changes to my statement?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  After receiving your statement, you can request reasonable amendments. Our legal team will review and incorporate any necessary changes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
  <div ref={ctaRef} className="bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-black/80 mb-12 max-w-2xl mx-auto">
              Begin your mitigation statement consultation today
            </p>
            <Button href="/chat" size="lg" className="bg-black text-[#73cfd0] hover:bg-white hover:text-black border-2 border-black transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Start Your Consultation
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </AdminLayout>
  );
}