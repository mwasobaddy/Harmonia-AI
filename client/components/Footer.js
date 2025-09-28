import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0f2b2fcc] text-white pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-12">
        <div className="flex-1 mb-8 md:mb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#73cfd0] flex items-center justify-center text-black text-2xl font-bold">H</div>
            <span className="text-2xl font-bold text-white">Harmonia-AI</span>
          </div>
          <p className="text-[#73cfd0] text-base max-w-xs">
            Professional mitigation statements powered by AI and legal expertise. Making justice accessible for everyone.
          </p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-[#73cfd0] tracking-wider uppercase mb-4">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/services" className="hover:text-[#73cfd0]">Driving Offenses</Link></li>
              <li><Link href="/services" className="hover:text-[#73cfd0]">TV Licensing</Link></li>
              <li><Link href="/services" className="hover:text-[#73cfd0]">Professional Regulation</Link></li>
              <li><Link href="/services" className="hover:text-[#73cfd0]">Minor Criminal Offenses</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#73cfd0] tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-[#73cfd0]">About</Link></li>
              <li><Link href="/contact" className="hover:text-[#73cfd0]">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[#73cfd0]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#73cfd0]">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 items-start md:items-end">
          <h3 className="text-sm font-semibold text-[#73cfd0] tracking-wider uppercase mb-2">Contact</h3>
          <a href="mailto:info@harmonia-ai.com" className="text-white hover:text-[#73cfd0]">info@harmonia-ai.com</a>
          <div className="flex gap-3 mt-2">
            <a href="#" className="hover:text-[#73cfd0]" aria-label="LinkedIn"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg></a>
            <a href="#" className="hover:text-[#73cfd0]" aria-label="Twitter"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482c-4.083-.205-7.697-2.162-10.125-5.138a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg></a>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-[#73cfd0] pt-8 text-center">
        <p className="text-base text-[#73cfd0]">
          &copy; 2025 Harmonia-AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}