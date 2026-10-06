import { useState } from 'react';

const imgPhoneCall = "/figma/b3d3693b2086c631fbce2ad4f23eef7c3a19367d.svg";
const imgEnvelope = "/figma/b4aff258f247b9fe1cc03cf21ef622b3f6ebe517.svg";
const imgClock = "/figma/ee1f1812981d3ecb5d456f147b101cb9258a7fa5.svg";
const imgLogo = "/figma/b888a9396e41ae8b3746258887ab3eadbe9402d1.svg";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col items-start" data-node-id="1:1833">
      {/* Top Bar (Node 1:1834) */}
      <div 
        className="bg-[#07152a] w-full px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] py-[10px] flex items-center justify-between" 
        data-node-id="1:1834"
      >
        <div className="max-w-[1600px] w-full mx-auto flex flex-wrap gap-6 lg:gap-[49px] items-center text-[12px] text-white font-medium" data-node-id="1:1835">
          <a 
            href="tel:6122053354" 
            className="flex items-center gap-[6px] hover:text-[#0094c5] transition-colors"
            data-node-id="1:1836"
          >
            <div className="relative shrink-0 size-[16px]" data-node-id="1:1837">
              <img alt="" className="size-full" src={imgPhoneCall} />
            </div>
            <span className="leading-normal" data-node-id="1:1838">(612) 205-3354</span>
          </a>
          <a 
            href="mailto:Taxmax@comcast.net" 
            className="flex items-center gap-[6px] hover:text-[#0094c5] transition-colors"
            data-node-id="1:1839"
          >
            <div className="relative shrink-0 size-[16px]" data-node-id="1:1840">
              <img alt="" className="size-full" src={imgEnvelope} />
            </div>
            <span className="leading-normal" data-node-id="1:1841">Taxmax@comcast.net</span>
          </a>
          <div className="hidden md:flex items-center gap-[6px]" data-node-id="1:1842">
            <div className="relative shrink-0 size-[16px]" data-node-id="1:1843">
              <img alt="" className="size-full" src={imgClock} />
            </div>
            <span className="leading-normal" data-node-id="1:1844">Mon–Fri: 8:00 AM – 6:00 PM CST</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Node 1:1845) */}
      <div 
        className="backdrop-blur-[15px] bg-[rgba(18,30,51,0.9)] w-full px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] py-[20px] shadow-[0px_27px_30px_rgba(0,0,0,0.06)] border-b border-white/10" 
        data-node-id="1:1845"
      >
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          {/* Logo (Node 1:1846) */}
          <a href="#" className="h-[38.107px] w-[159px] shrink-0 block relative" data-node-id="1:1846">
            <img alt="TAXMAX" className="h-full w-auto object-contain" src={imgLogo} />
          </a>

          {/* Desktop Nav Links (Node 1:1855) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-[32px] 3xl:gap-[40px] text-[14px] 2xl:text-[15px] text-white font-normal whitespace-nowrap" data-node-id="1:1855">
            <a href="#services" className="hover:text-[#0094c5] transition-colors" data-node-id="1:1856">Services</a>
            <a href="#why-us" className="hover:text-[#0094c5] transition-colors" data-node-id="1:1857">Why TAXMAX</a>
            <a href="#estimator" className="hover:text-[#0094c5] transition-colors" data-node-id="1:1858">Estimator</a>
            <a href="#process" className="hover:text-[#0094c5] transition-colors" data-node-id="1:1859">Process</a>
            <a href="#reviews" className="hover:text-[#0094c5] transition-colors" data-node-id="1:1860">Reviews</a>
            <a href="#faqs" className="hover:text-[#0094c5] transition-colors" data-node-id="1:1861">FAQs</a>
          </nav>

          {/* Action Buttons (Node 1:1862) */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-[20px]" data-node-id="1:1862">
            <button 
              type="button" 
              className="backdrop-blur-[10px] bg-white/10 border border-white/10 px-[20px] py-[12px] rounded-[100px] text-[14px] font-semibold text-white hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
              data-node-id="1:1863"
            >
              Login
            </button>
            <a 
              href="#contact"
              className="bg-[#0094c5] border border-white/10 px-[20px] py-[12px] rounded-[100px] text-[14px] font-bold text-white hover:bg-[#0082ad] transition-all shadow-md hover:shadow-cyan-500/20 text-center cursor-pointer whitespace-nowrap"
              data-node-id="1:1865"
            >
              Submit Documents
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button 
            type="button" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-[#0094c5] focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-[#0d1d35] border-b border-white/10 px-6 py-6 flex flex-col gap-4 text-white">
          <nav className="flex flex-col gap-3 text-[16px] font-medium">
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-[#0094c5]"
            >
              Services
            </a>
            <a 
              href="#why-us" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-[#0094c5]"
            >
              Why TAXMAX
            </a>
            <a 
              href="#estimator" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-[#0094c5]"
            >
              Estimator
            </a>
            <a 
              href="#process" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-[#0094c5]"
            >
              Process
            </a>
            <a 
              href="#reviews" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-[#0094c5]"
            >
              Reviews
            </a>
            <a 
              href="#faqs" 
              onClick={() => setMobileMenuOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-[#0094c5]"
            >
              FAQs
            </a>
          </nav>
          <div className="flex flex-col gap-3 pt-3">
            <button 
              type="button" 
              className="w-full bg-white/10 border border-white/10 py-3 rounded-full text-[15px] font-semibold text-white"
            >
              Login
            </button>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className="w-full bg-[#0094c5] py-3 rounded-full text-[15px] font-bold text-white text-center shadow-lg"
            >
              Submit Documents
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
