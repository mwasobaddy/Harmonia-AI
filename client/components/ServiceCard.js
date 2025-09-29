import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function ServiceCard({ title, description, price, features }) {
  const cardRef = useRef(null);
  
  // Track if the card has completed its initial animation (scrolled down into view)
  const isPermanentlyVisibleRef = useRef(false); 

  // Keep the scroll direction logic
  const lastScrollYRef = useRef(
    typeof window !== "undefined" ? window.scrollY : 0
  );
  const scrollDirRef = useRef("down");

  const animateIn = () => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
      }
    );
  }

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === "undefined") return;

    // Start hidden
    gsap.set(card, { opacity: 0, y: 40 });

    const onScroll = () => {
      const current = window.scrollY;
      if (current < lastScrollYRef.current) {
        scrollDirRef.current = "up";
      } else if (current > lastScrollYRef.current) {
        scrollDirRef.current = "down";
      }
      lastScrollYRef.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            
            if (!isPermanentlyVisibleRef.current) {
              // 1. First time intersecting (initial scroll down) -> Animate once
              isPermanentlyVisibleRef.current = true;
              animateIn();
              return;
            }
            
            if (scrollDirRef.current === "up") {
              // 2. Animate every time when scrolling UP and re-entering
              animateIn();
            } else {
              // 3. Scrolling down past an already seen card -> keep visible
              gsap.set(card, { opacity: 1, y: 0 });
            }

          } else {
            // Card is NOT intersecting (out of the viewport)
            
            // 4. Hide only if leaving the viewport while scrolling DOWN
            // This is the only way to re-enable the scroll-up animation later
            if (isPermanentlyVisibleRef.current && scrollDirRef.current === "down") {
              gsap.set(card, { opacity: 0, y: 40 });
            }
          }
        });
      },
      // Keep your existing intersection configuration
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" } 
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    // ... (rest of the JSX)
    <div
      ref={cardRef}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#73cfd0]/30 transition-all duration-500 group hover:bg-white/10"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-bold text-white group-hover:text-[#73cfd0] transition-colors duration-300">
          {title}
        </h3>
        <div className="text-right">
          <span className="text-3xl font-black text-[#73cfd0]">{price}</span>
          <div className="text-sm text-gray-400">per statement</div>
        </div>
      </div>

      <p className="text-gray-300 mb-8 text-lg leading-relaxed">
        {description}
      </p>

      <div className="space-y-3">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#73cfd0]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 12l2 2 4-4" />
          </svg>
          What's Included
        </h4>
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center text-gray-300">
            <div className="w-2 h-2 bg-[#73cfd0] rounded-full mr-3 flex-shrink-0"></div>
            {feature}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <a
          href="/chat"
          className="block w-full text-center px-6 py-3 rounded-xl bg-[#73cfd0]/10 text-[#73cfd0] font-semibold border border-[#73cfd0]/30 hover:bg-[#73cfd0] hover:text-black transition-all duration-300 group-hover:scale-105"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}