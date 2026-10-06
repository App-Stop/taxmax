const imgLogo = "/figma/9315c4c12234a417c93d5b135afec1e891be203f.svg";
const imgPhoneCall = "/figma/10b19cf76f24e8f7aa85df21a35f9a3b834408d5.svg";
const imgEnvelope = "/figma/c616f4fca8308f376b608ef41cc7a1334905c6b4.svg";
const imgSocial1 = "/figma/379556df046a56de8943859854429be7d1cd0f6a.png";
const imgSocial2 = "/figma/6351344db88a61a36e9572eb6bcfc1ae57b19317.png";
const imgSocial3 = "/figma/e10d1561dd50fa5813f15399e4e72207602bc12d.png";

export default function Footer() {
  return (
    <footer className="w-full bg-[#07152a] border-t border-[rgba(255,255,255,0.1)] py-16 xl:py-[80px]" data-node-id="1:1763">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] flex flex-col gap-12 xl:gap-[50px] 2xl:gap-[55px] 3xl:gap-[60px] items-start">
        
        {/* Main Content (Node 1:1764) */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 xl:gap-8 2xl:gap-10 3xl:gap-8 w-full" data-node-id="1:1764">
          
          {/* Brand Area (Node 1:1765) */}
          <div className="flex flex-col gap-6 sm:gap-[32px] items-start w-full lg:w-[380px] 2xl:w-[400px] 3xl:w-[420px] shrink-0" data-node-id="1:1765">
            <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="1:1766">
              <a href="#" className="h-[40px] 2xl:h-[42px] 3xl:h-[45.729px] w-[160px] 2xl:w-[175px] 3xl:w-[190.8px] relative block" data-node-id="1:1767">
                <img alt="TAXMAX" className="size-full object-contain" src={imgLogo} />
              </a>
              <p className="font-normal text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] leading-relaxed xl:leading-[22px] 2xl:leading-[24px] 3xl:leading-[26px] opacity-80 text-[#cfcfcf] max-w-[420px]" data-node-id="1:1776">
                From personal returns to small business accounting, payroll, and audit defense — secure and certified financial partnership.
              </p>
            </div>

            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[16px] items-start" data-node-id="1:1777">
              <div className="flex items-center" data-node-id="1:1778">
                <p className="font-normal text-[11px] sm:text-[13px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#dcdcdc] leading-normal whitespace-nowrap" data-node-id="1:1779">
                  Minneapolis, MN • Remote Services Nationwide
                </p>
              </div>

              <a 
                href="tel:6122053354" 
                className="flex gap-2 2xl:gap-2.5 3xl:gap-[12px] items-center hover:text-[#0094c5] transition-colors cursor-pointer"
                data-node-id="1:1780"
              >
                <div className="relative shrink-0 size-6 2xl:size-[28px] 3xl:size-[32px]" data-node-id="1:1781">
                  <img alt="" className="size-full" src={imgPhoneCall} />
                </div>
                <span className="font-normal text-[11px] sm:text-[13px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#dcdcdc] leading-normal whitespace-nowrap" data-node-id="1:1782">
                  (612) 205-3354
                </span>
              </a>

              <a 
                href="mailto:taxmax@comcast.net" 
                className="flex gap-2 2xl:gap-2.5 3xl:gap-[12px] items-center hover:text-[#0094c5] transition-colors cursor-pointer"
                data-node-id="1:1783"
              >
                <div className="relative shrink-0 size-6 2xl:size-[28px] 3xl:size-[32px]" data-node-id="1:1784">
                  <img alt="" className="size-full" src={imgEnvelope} />
                </div>
                <span className="font-normal text-[11px] sm:text-[13px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#dcdcdc] leading-normal whitespace-nowrap" data-node-id="1:1785">
                  taxmax@comcast.net
                </span>
              </a>
            </div>
          </div>

          {/* Navigation Columns (Node 1:1786) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-6 xl:gap-8 2xl:gap-10 3xl:gap-[80px] items-start leading-normal w-full lg:w-auto" data-node-id="1:1786">
            
            {/* Column 1: Services (Node 1:1787) */}
            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[20px] items-start w-full sm:w-[140px] 2xl:w-[160px] 3xl:w-[180px]" data-node-id="1:1787">
              <h4 className="font-bold text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] text-white uppercase tracking-wider" data-node-id="1:1788">
                Services
              </h4>
              <div className="flex flex-col font-normal gap-2 2xl:gap-2.5 3xl:gap-[12px] items-start text-[11px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#cfcfcf]" data-node-id="1:1789">
                <a href="#services" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1790">Tax Preparation</a>
                <a href="#services" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1791">Bookkeeping &amp; Advisory</a>
                <a href="#services" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1792">Payroll Services</a>
                <a href="#services" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1793">Business Planning</a>
                <a href="#services" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1794">Audit Defense</a>
              </div>
            </div>

            {/* Column 2: Company (Node 1:1795) */}
            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[20px] items-start w-full sm:w-[140px] 2xl:w-[160px] 3xl:w-[180px]" data-node-id="1:1795">
              <h4 className="font-bold text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] text-white uppercase tracking-wider" data-node-id="1:1796">
                Company
              </h4>
              <div className="flex flex-col font-normal gap-2 2xl:gap-2.5 3xl:gap-[12px] items-start text-[11px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#cfcfcf]" data-node-id="1:1797">
                <a href="#why-us" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1798">About TAXMAX</a>
                <a href="#why-us" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1799">Our Team</a>
                <a href="#reviews" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1800">Customer Reviews</a>
                <a href="#contact" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1801">Careers</a>
                <a href="#contact" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1802">Press Kit</a>
              </div>
            </div>

            {/* Column 3: Resources (Node 1:1803) */}
            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[20px] items-start w-full sm:w-[140px] 2xl:w-[160px] 3xl:w-[180px]" data-node-id="1:1803">
              <h4 className="font-bold text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] text-white uppercase tracking-wider" data-node-id="1:1804">
                Resources
              </h4>
              <div className="flex flex-col font-normal gap-2 2xl:gap-2.5 3xl:gap-[12px] items-start text-[11px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#cfcfcf]" data-node-id="1:1805">
                <a href="#estimator" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1806">Tax Estimator</a>
                <a href="#faqs" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1807">2026 Deadlines</a>
                <a href="#faqs" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1808">Record Retention Guide</a>
                <a href="#estimator" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1809">Filing Status Guide</a>
                <a href="#contact" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1810">Help Center</a>
              </div>
            </div>

            {/* Column 4: Security (Node 1:1811) */}
            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[20px] items-start w-full sm:w-[140px] 2xl:w-[160px] 3xl:w-[180px]" data-node-id="1:1811">
              <h4 className="font-bold text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] text-white uppercase tracking-wider" data-node-id="1:1812">
                Security
              </h4>
              <div className="flex flex-col font-normal gap-2 2xl:gap-2.5 3xl:gap-[12px] items-start text-[11px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] text-[#cfcfcf]" data-node-id="1:1813">
                <a href="#reviews" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1814">IRS Accuracy Rate</a>
                <a href="#why-us" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1815">Audit Shield</a>
                <a href="#services" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1816">Compliance Shield</a>
                <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-pointer" data-node-id="1:1817">System Status</span>
                <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-pointer" data-node-id="1:1818">Security Standards</span>
              </div>
            </div>

          </div>

        </div>

        {/* Social Row Container (Node 1:1819) */}
        <div 
          className="border-y border-[rgba(255,255,255,0.1)] py-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full" 
          data-node-id="1:1819"
        >
          <p className="font-normal text-[13px] 3xl:text-[12px] text-[#cfcfcf] opacity-80 whitespace-nowrap" data-node-id="1:1820">
            Connect with our financial community online:
          </p>
          <div className="flex gap-[16px] items-start shrink-0" data-node-id="1:1821">
            <a 
              href="#" 
              className="p-[8px] rounded-full shrink-0 size-[48px] hover:opacity-80 transition-opacity" 
              data-node-id="1:1822"
            >
              <img alt="Social" className="size-full object-cover rounded-full pointer-events-none" src={imgSocial1} />
            </a>
            <a 
              href="#" 
              className="p-[8px] rounded-full shrink-0 size-[48px] hover:opacity-80 transition-opacity" 
              data-node-id="1:1823"
            >
              <img alt="Social" className="size-full object-cover rounded-full pointer-events-none" src={imgSocial2} />
            </a>
            <a 
              href="#" 
              className="p-[8px] rounded-full shrink-0 size-[48px] hover:opacity-80 transition-opacity" 
              data-node-id="1:1824"
            >
              <img alt="Social" className="size-full object-cover rounded-full pointer-events-none" src={imgSocial3} />
            </a>
          </div>
        </div>

        {/* Footer Bottom Bar (Node 1:1825) */}
        <div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full text-[13px] 3xl:text-[12px]" 
          data-node-id="1:1825"
        >
          <div className="flex items-center" data-node-id="1:1826">
            <p className="font-normal text-[#cfcfcf] opacity-60 whitespace-nowrap" data-node-id="1:1827">
              2026 TAXMAX Consulting. All rights reserved. IRS Certified &amp; Registered Partner.
            </p>
          </div>
          <div className="flex font-normal gap-[16px] items-center text-[#cfcfcf] whitespace-nowrap" data-node-id="1:1828">
            <a href="#" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1829">Privacy Policy</a>
            <a href="#" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1830">Terms of Service</a>
            <a href="#" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1831">Sitemap</a>
            <a href="#" className="opacity-80 hover:opacity-100 hover:text-white transition-opacity" data-node-id="1:1832">Disclosure</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
