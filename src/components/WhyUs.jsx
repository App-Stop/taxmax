const imgWhyUsPartnership = "/figma/why-us-partnership.png";
const imgListChecks = "/figma/3881f7d6d4431767fd93adc0c43085bdbeb04c4f.svg";
const imgShieldPlus = "/figma/6b77ff2ebc2a5c1e2805a1b55df6a3034b9a9b75.svg";
const imgUserSound = "/figma/e1b481f996c22bdac187fae3f94eaa1309d8ef5d.svg";
const imgChatsTeardrop = "/figma/aaddc7868bcb3a2bb0c6244903b89d4b6d900b78.svg";

const pillars = [
  {
    title: 'Proactive Tax Strategies',
    description: 'Quarterly reviews so you are never surprised by an unexpected IRS bill.',
    icon: imgListChecks,
    nodeId: '1:1597'
  },
  {
    title: 'Dedicated Audit Defense',
    description: 'Authorized representation before the IRS & MN Department of Revenue.',
    icon: imgShieldPlus,
    nodeId: '1:1601'
  },
  {
    title: 'Dedicated Senior Attention',
    description: 'Work directly with experienced professionals who understand your goals.',
    icon: imgUserSound,
    nodeId: '1:1605'
  },
  {
    title: 'Plain-English Advice',
    description: 'Straightforward answers with zero confusing accounting jargon.',
    icon: imgChatsTeardrop,
    nodeId: '1:1609'
  }
];

export default function WhyUs() {
  return (
    <section id="why-us" className="w-full bg-white py-16 sm:py-24 xl:py-[200px]" data-node-id="1:1580">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px]">
        <div className="flex flex-col xl:flex-row gap-10 xl:gap-10 2xl:gap-20 items-center">
          
          {/* Left Column: Entire Frame 1:1581 as 1 single asset (Node 1:1581) */}
          <div className="relative w-full xl:w-[460px] 2xl:w-[540px] 3xl:w-[704px] shrink-0" data-node-id="1:1581">
            <img 
              alt="TAXMAX Advisors in Discussion - Decades of Trusted Financial Partnership" 
              className="w-full h-auto object-contain" 
              src={imgWhyUsPartnership}
            />
          </div>

          {/* Right Column: Title, Subtitle, CTA, 4 Value Pillars (Node 1:1588) */}
          <div className="flex flex-col gap-8 xl:gap-[28px] 2xl:gap-[32px] 3xl:gap-[40px] items-start flex-1 min-w-0" data-node-id="1:1588">
            
            {/* Title & Narrative (Node 1:1589) */}
            <div className="flex flex-col gap-2 2xl:gap-[8px] 3xl:gap-[10px] items-start w-full" data-node-id="1:1589">
              <h2 className="font-bold text-[23px] sm:text-[29px] xl:text-[33px] 2xl:text-[39px] 3xl:text-[48px] tracking-tight leading-tight xl:leading-[44px] 2xl:leading-[50px] 3xl:leading-[60px] text-black w-full" data-node-id="1:1590">
                <span>We View Every Client Relationship Like a </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#0094c5] to-[#0074bc] text-transparent">
                  True Partnership.
                </span>
              </h2>
              <p className="font-medium text-[13px] sm:text-[15px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[18px] leading-relaxed xl:leading-[24px] 2xl:leading-[27px] 3xl:leading-[32px] text-black w-full" data-node-id="1:1591">
                Most tax preparers vanish after April 15th, but at TAXMAX Consulting, we treat your taxes as a year-round tool for financial security and growth. We build strong relationships, giving each client personal attention backed by expertise. From accurate returns to payroll and audit support, we're here all year so you can focus on your business.
              </p>
            </div>

            {/* Quick CTA banner (Node 1:1592) */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 2xl:gap-4 3xl:gap-[20px] items-center w-full" data-node-id="1:1592">
              <a 
                href="#contact"
                className="bg-[#0094c5] border border-white/10 px-5 sm:px-6 xl:px-[20px] 2xl:px-[22px] 3xl:px-[20px] py-3 sm:py-3.5 xl:py-3 rounded-[100px] font-extrabold text-[13px] sm:text-[15px] xl:text-[15px] 2xl:text-[17px] 3xl:text-[16px] text-white hover:bg-[#0082ad] transition-all shadow-lg hover:shadow-cyan-500/20 shrink-0 cursor-pointer text-center"
                data-node-id="1:1593"
              >
                Upload Documents
              </a>
              <p className="font-normal text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[15px] 3xl:text-[18px] leading-snug xl:leading-[22px] 2xl:leading-[25px] 3xl:leading-[30px] text-[#444444] flex-1" data-node-id="1:1595">
                Ready to file? Upload your documents securely and we'll handle the rest.
              </p>
            </div>

            {/* 4 Pillars Grid (Node 1:1596) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 2xl:gap-4 3xl:gap-[30px] w-full" data-node-id="1:1596">
              {pillars.map((pillar) => (
                <div 
                  key={pillar.title}
                  className="bg-[rgba(0,148,197,0.1)] p-3 sm:p-4 xl:p-[16px] 2xl:p-[18px] 3xl:p-[20px] rounded-[20px] flex flex-col gap-2 2xl:gap-2.5 3xl:gap-[10px] items-start w-full 3xl:w-[388px] border border-transparent hover:border-[#0094c5]/20 transition-colors"
                  data-node-id={pillar.nodeId}
                >
                  <div className="relative shrink-0 size-[32px] 2xl:size-[36px] 3xl:size-[40px]">
                    <img alt="" className="size-full" src={pillar.icon} />
                  </div>
                  <h3 className="font-bold text-[15px] sm:text-[17px] xl:text-[16px] 2xl:text-[17.5px] 3xl:text-[18px] text-[#111111] leading-normal whitespace-nowrap">
                    {pillar.title}
                  </h3>
                  <p className="font-normal text-[11px] sm:text-[13px] xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] text-[#111111] opacity-80 leading-relaxed xl:leading-[20px] 2xl:leading-[22px] 3xl:leading-[24px]">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
