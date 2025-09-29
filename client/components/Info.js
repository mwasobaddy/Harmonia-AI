
import { Info as InfoIcon, Target, Zap, Shield } from 'lucide-react';

export default function Info() {
  const steps = [
    {
      number: 1,
      title: "Choose Your Service",
      description: "Select your offense type and complete our intelligent questionnaire that adapts to your specific situation",
      icon: <Target className="w-8 h-8" />
    },
    {
      number: 2,
      title: "AI Generation",
      description: "Our advanced AI analyzes your case and creates a professional mitigation statement using extensive legal expertise",
      icon: <Zap className="w-8 h-8" />
    },
    {
      number: 3,
      title: "Legal Review",
      description: "A qualified solicitor reviews and refines your statement before secure delivery within 24 hours",
      icon: <Shield className="w-8 h-8" />
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#73cfd0]/10 border border-[#73cfd0]/20 text-sm text-[#73cfd0] font-medium mb-6">
            <InfoIcon className="w-4 h-4 mr-2" />
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Simple, Secure Process
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            From consultation to delivery in three streamlined steps
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#73cfd0] to-transparent transform -translate-x-8 z-0"></div>
              )}

              <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#73cfd0]/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl text-center">
                {/* Step Number */}
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] rounded-2xl flex items-center justify-center text-black text-2xl font-black shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="text-[#73cfd0] mb-4 flex justify-center">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#73cfd0] transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}