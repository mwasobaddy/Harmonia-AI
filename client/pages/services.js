import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ServiceCard from "../components/ServiceCard";
import { Footer, Layout } from "../components";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function Services() {
  const headerRef = useRef(null);

  const services = [
    {
      title: "Driving Offenses",
      description:
        "Speeding, drink driving, and other motoring offenses. Our AI understands the specific requirements for magistrates' courts and can reference relevant sentencing guidelines.",
      price: "£75",
      features: [
        "Traffic violation expertise",
        "Drink driving mitigation",
        "Speeding offense statements",
        "License implications assessment",
      ],
    },
    {
      title: "TV Licensing",
      description:
        "TV license evasion and related offenses. Specialized knowledge of broadcasting regulations and enforcement procedures.",
      price: "£65",
      features: [
        "Broadcasting law expertise",
        "Regulatory compliance",
        "Financial circumstances",
        "Alternative payment arrangements",
      ],
    },
    {
      title: "Professional Regulation",
      description:
        "Regulatory body hearings and professional discipline matters. Understanding of professional conduct rules and tribunal procedures.",
      price: "£95",
      features: [
        "Professional regulation knowledge",
        "Tribunal procedures",
        "Career impact assessment",
        "Remedial action planning",
      ],
    },
    {
      title: "Minor Criminal Offenses",
      description:
        "Other minor criminal matters and summary offenses. Comprehensive coverage of criminal justice procedures and mitigation factors.",
      price: "£75",
      features: [
        "Criminal law expertise",
        "Court procedure knowledge",
        "Character references",
        "Personal circumstances",
      ],
    },
  ];

  useEffect(() => {
    let st;
    let anim;

    if (headerRef.current) {
      const elems = headerRef.current.children;

      // Create a paused animation that we can control via ScrollTrigger callbacks
      anim = gsap.fromTo(
        elems,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          paused: true,
        }
      );

      // Use ScrollTrigger callbacks to play the animation only when scrolling up (enterBack)
      st = ScrollTrigger.create({
        trigger: headerRef.current,
        start: "top 85%",
        onEnter: () => {
          // Scrolling down into view — snap to final state without playing animation
          anim.progress(1).pause();
        },
        onEnterBack: () => {
          // Scrolling up into view — play animation
          anim.restart();
        },
      });
    }

    // ✅ Important: refresh ScrollTrigger once everything is mounted
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      if (st) st.kill();
      if (anim) anim.kill();
    };
  }, []);


  return (
    <Layout
      title="Our Services - Harmonia-AI"
      description="Professional mitigation statement services for different types of legal matters"
    >
      <div className="bg-gradient-to-b from-[#0f2b2f] to-[#1a2332]">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div ref={headerRef} className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#73cfd0]/10 border border-[#73cfd0]/20 text-sm text-[#73cfd0] font-medium mb-6">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 7v10M10 7v10M14 7v10M18 7v10" />
              </svg>
              Our Services
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Specialized Legal Solutions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Professional mitigation services tailored to your specific legal
              situation
            </p>
          </div>

          {/* Services grid */}
          <div className="grid gap-10 md:grid-cols-2 mb-20">
            {services.map((service, index) => (
              <ServiceCard key={`service-${index}`} {...service} />
            ))}
          </div>

          {/* CTA section */}
          <div className="text-center">
            <p className="text-[#73cfd0]/80 mb-6 text-lg">
              All services include professional solicitor review and approval
              before delivery.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center px-8 py-3 rounded-xl bg-[#73cfd0] text-black font-semibold shadow-lg hover:bg-[#5abdc4] hover:text-white transition-all duration-300 text-lg group"
            >
              Start Your Statement
              <svg
                className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
