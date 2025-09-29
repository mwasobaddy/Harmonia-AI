
import Link from 'next/link';
import { ChevronRight, Shield } from 'lucide-react';


export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0f1419] to-[#0a0f14] text-white pt-20 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#73cfd0] to-[#5abdc4] flex items-center justify-center text-black text-2xl font-bold shadow-lg">
                H
              </div>
              <span className="text-3xl font-black text-white tracking-tight">Harmonia-AI</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-8">
              Professional mitigation statements powered by AI and legal expertise. 
              Making justice accessible and affordable for everyone.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {[
                { name: 'LinkedIn', icon: '💼' },
                { name: 'Twitter', icon: '🐦' },
                { name: 'Email', icon: '📧' }
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-[#73cfd0]/20 border border-white/10 hover:border-[#73cfd0]/50 flex items-center justify-center text-xl transition-all duration-300 hover:transform hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-[#73cfd0] mb-6">Services</h3>
            <ul className="space-y-4">
              {['Driving Offenses', 'TV Licensing', 'Professional Regulation', 'Criminal Matters'].map((service) => (
                <li key={service}>
                  <Link href="/services" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-[#73cfd0] mb-6">Company</h3>
            <ul className="space-y-4">
              {['About', 'Contact', 'Privacy', 'Terms'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              © 2025 Harmonia-AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Secure & Confidential</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}