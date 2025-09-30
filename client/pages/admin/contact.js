import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button, Footer } from '../../components';
import AdminLayout from "../../components/admin/AdminLayout";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const heroRef = useRef(null);
  const contactRef = useRef(null);
  const ctaRef = useRef(null);

  const contactInfo = [
    {
      title: "Email Support",
      content: "support@Harmonia-AI.com",
      subtext: "We typically respond within 24 hours",
      icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    },
    {
      title: "Business Hours",
      content: "Monday - Friday: 9:00 AM - 6:00 PM GMT\nSaturday: 10:00 AM - 4:00 PM GMT\nSunday: Closed",
      subtext: "",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      title: "Emergency Legal Support",
      content: "For urgent legal matters, please contact your solicitor directly.",
      subtext: "Our service is for mitigation statement preparation only.",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    }
  ];

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }

    // Contact info animation
    if (contactRef.current) {
      gsap.fromTo(
        contactRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }

    // CTA animation
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <AdminLayout title="Admin - Contact" description="Admin contact for Harmonia-AI platform">
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
                  <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Contact Us
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                Get in <span className="text-[#73cfd0]">Touch</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Have questions? We're here to help with your legal mitigation needs.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="py-24 bg-gradient-to-b from-transparent to-[#0f2b2f]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Contact Information
              </h2>
              <p className="text-xl text-[#73cfd0] max-w-2xl mx-auto">
                Reach out to us through any of these channels
              </p>
            </div>

            <div ref={contactRef} className="max-w-4xl mx-auto grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#73cfd0]/20 text-[#73cfd0] group-hover:bg-[#73cfd0] group-hover:text-black transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d={info.icon}></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#73cfd0] transition-colors duration-300">
                      {info.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {info.content}
                  </p>
                  {info.subtext && (
                    <p className="text-[#73cfd0] text-sm mt-3">
                      {info.subtext}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-black/80 mb-12 max-w-2xl mx-auto">
              Create your professional mitigation statement today
            </p>
            <Button href="/chat" size="lg" className="bg-black text-[#73cfd0] hover:bg-white hover:text-black border-2 border-black transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Start Your Statement
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </AdminLayout>
  );
}