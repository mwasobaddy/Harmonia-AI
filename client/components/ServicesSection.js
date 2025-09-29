
import { CheckCircle, ArrowRight, Briefcase, CarTaxiFront, Tv, Scale, Landmark } from 'lucide-react';
import Button from './Button';

export default function ServicesSection() {
  const services = [
    {
      title: "Driving Offenses",
      description: "Speeding, drink driving, and other motoring offenses",
      price: "£75",
      icon: CarTaxiFront,
      features: ["Professional mitigation", "Court representation advice", "24hr delivery"]
    },
    {
      title: "TV Licensing",
      description: "TV license evasion and related offenses",
      price: "£65",
      icon: Tv,
      features: ["Tailored defense", "Legal precedent research", "Quick turnaround"]
    },
    {
      title: "Professional Regulation",
      description: "Regulatory body hearings and professional discipline",
      price: "£95",
      icon: Scale,
      features: ["Expert analysis", "Career protection focus", "Confidential service"]
    },
    {
      title: "Minor Criminal Offenses",
      description: "Other minor criminal matters and summary offenses",
      price: "£75",
      icon: Landmark,
      features: ["Comprehensive review", "Mitigation strategies", "Legal guidance"]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#0f2b2f] to-[#1a2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#73cfd0]/10 border border-[#73cfd0]/20 text-sm text-[#73cfd0] font-medium mb-6">
            <Briefcase className="w-4 h-4 mr-2" />
            Our Services
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Specialized Legal Solutions
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional mitigation services tailored to your specific legal situation
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#73cfd0]/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#73cfd0]/0 via-[#73cfd0]/5 to-[#73cfd0]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                {/* Icon */}
                <div className="text-4xl mb-4">
                  {typeof service.icon === "string" ? (
                    service.icon
                  ) : (
                    <service.icon className="w-10 h-10 text-[#73cfd0]" />
                  )}
                </div>
                {/* Price Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] text-black px-3 py-1 rounded-full text-sm font-bold">
                  {service.price}
                </div>
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#73cfd0] transition-colors">
                  {service.title}
                </h3>
                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>
                {/* Features */}
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-[#73cfd0] mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                {/* CTA Button */}
                <Button 
                  href="/chat" 
                  size="sm" 
                  className="w-full group-hover:bg-[#73cfd0] group-hover:text-black transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}