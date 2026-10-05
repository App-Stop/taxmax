import { useState } from 'react';

const imgAGlossySemi3DIconIllustrationForIncomeTax1 = "/figma/d05ed32d8d48ac28da524020d8fcb1dc68cfaa1b.png";
const imgAGlossySemi3DIconIllustrationForIncomeTax2 = "/figma/313a8deda36c3d20f5989e505e8059bf92f3b1cc.png";
const imgAGlossySemi3DIconIllustrationForIncomeTax3 = "/figma/ab28b240fe3cd4ddda0ab306a96cfa8cc51303e3.png";
const imgAGlossySemi3DIconIllustrationForIncomeTax4 = "/figma/8650db7fb75649935beae06b5a8ba483e83af25c.png";
const imgAGlossySemi3DIconIllustrationForIncomeTax5 = "/figma/ae21e9b66138a9ae99942843f353e16f27090ca2.png";
const imgImage17 = "/figma/5544fd20f1818009919ceebf043a68a3121af6af.png";
const imgImage18 = "/figma/4ddf288c7a19e078e381d14d1135a6f41a788918.png";
const imgCheck = "/figma/b0fa55a265096965bf743f394e19a011dac79908.svg";
const imgArrowRight = "/figma/8720f639cc94615397c005e94229b1e3166db1bb.svg";
const imgAdobeExpressQrCode1 = "/figma/ade0003ecd704f4f58f8be66d8f520692faa8db1.svg";
const imgGroup6894 = "/figma/7146400d00d6801605b2cdea6b0f7c246facf3d7.svg";
const imgGroup6893 = "/figma/c388e7751a24b4ad6a2e5f7b086563f588eb52d4.svg";
const imgPath90 = "/figma/1527a79d815d5f49d860a77d6582f671b77f30f5.svg";

const tabOptions = [
  'All Services',
  'Tax Preparation',
  'Bookkeeping & Advisory',
  'Payroll & Compliance',
  'Business Compliance',
  'Audit Defense'
];

const allCards = [
  {
    id: 'tax-prep',
    category: 'Tax Preparation',
    nodeId: '1:1094',
    bannerBg: 'bg-[#ffdede]',
    image: imgAGlossySemi3DIconIllustrationForIncomeTax1,
    imageHeight: 'h-[197px]',
    title: 'Strategic Income Tax Preparation',
    description: 'Accurate, on-time federal and state tax filings for individuals (1040), LLCs, S-Corporations (1120-S), and Partnerships (1065). We search every allowable deduction so you keep more of what you earn.',
    features: [
      'Federal, Minnesota & Multi-State personal & business returns',
      'S-Corp owner compensation & distribution tax planning',
      'Direct, authorized electronic filing with fast IRS confirmation'
    ],
    ctaText: 'Start Tax Prep'
  },
  {
    id: 'bookkeeping',
    category: 'Bookkeeping & Advisory',
    nodeId: '1:1115',
    bannerBg: 'bg-[#f6ffde]',
    image: imgAGlossySemi3DIconIllustrationForIncomeTax2,
    imageHeight: 'h-[197px]',
    title: 'Monthly Bookkeeping & Reporting',
    description: 'Clean books mean smarter business decisions and stress-free taxes. We handle monthly bank reconciliations, maintain your general ledger, and deliver clear profit & loss statements every month.',
    features: [
      'Monthly bank, credit card & payment processor reconciliations',
      'QuickBooks® Online setup, backlog cleanup & staff training',
      'Accurate Balance Sheet & P&L statements ready for tax time'
    ],
    ctaText: 'Get Started'
  },
  {
    id: 'payroll',
    category: 'Payroll & Compliance',
    nodeId: '1:1137',
    bannerBg: 'bg-[#f6ffde]',
    image: imgAGlossySemi3DIconIllustrationForIncomeTax3,
    imageHeight: 'h-[197px]',
    title: 'Hassle-Free Payroll Services',
    description: 'Pay your employees and contractors quickly without worrying about costly payroll tax penalties. We automate paychecks, direct deposits, tax withholdings, and quarterly filings.',
    features: [
      'Swift direct deposits & contractor 1099 disbursements',
      'Federal Form 941, 940, and state unemployment tax filings',
      'Year-end electronic W-2 and W-3 generation and delivery'
    ],
    ctaText: 'Get Started'
  },
  {
    id: 'business-planning',
    category: 'Business Compliance',
    nodeId: '1:1159',
    bannerBg: 'bg-[#f6ffde]',
    image: imgAGlossySemi3DIconIllustrationForIncomeTax4,
    imageHeight: 'h-[197px]',
    title: 'Business Planning & Entity Selection',
    description: 'Starting a new venture or restructuring? Choosing between an LLC, S-Corp, or C-Corp impacts your taxes for years. We help you choose the ideal entity and set up a solid financial roadmap.',
    features: [
      'Entity selection analysis (LLC vs. S-Corp vs. C-Corp)',
      'New business tax registrations, EIN, and state paperwork',
      'Cash flow projections, expense budgeting & growth strategy'
    ],
    ctaText: 'Get Started'
  },
  {
    id: 'audit-defense',
    category: 'Audit Defense',
    nodeId: '1:1182',
    bannerBg: 'bg-[#f6ffde]',
    image: imgAGlossySemi3DIconIllustrationForIncomeTax5,
    imageHeight: 'h-[183px]',
    title: 'IRS & State Audit Representation',
    description: 'Received a notice or audit inquiry from the IRS or Minnesota Department of Revenue? Never speak to the IRS alone. We act as your authorized representative to defend your return and resolve issues.',
    features: [
      'Direct representation before the IRS & MN Department of Revenue',
      'Notice review, back tax negotiations & penalty abatement requests',
      'Complete audit defense documentation review and settlement'
    ],
    ctaText: 'Get Started'
  }
];

export default function Services() {
  const [activeTab, setActiveTab] = useState('All Services');

  const visibleCards = activeTab === 'All Services'
    ? allCards
    : allCards.filter(c => c.category.toLowerCase().includes(activeTab.toLowerCase().split(' ')[0]));

  const showAppCard = activeTab === 'All Services' || activeTab.includes('Payroll') || activeTab.includes('Bookkeeping');

  return (
    <section id="services" className="w-full bg-white py-16 sm:py-24 xl:py-[100px]" data-node-id="1:1075">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-[160px] flex flex-col gap-10 xl:gap-[40px] items-center">
        
        {/* Section Header (Node 1:1076) */}
        <div className="flex flex-col gap-2 2xl:gap-[10px] items-center text-center max-w-[857px]" data-node-id="1:1076">
          <h2 className="font-bold text-2xl sm:text-3xl xl:text-[34px] 2xl:text-[48px] tracking-tight text-black leading-tight xl:leading-[44px] 2xl:leading-[60px]" data-node-id="1:1077">
            Full-Spectrum Tax &amp; Financial Advisory
          </h2>
          <p className="font-medium text-sm sm:text-base xl:text-[15px] 2xl:text-[20px] leading-relaxed xl:leading-[24px] 2xl:leading-[32px] text-black" data-node-id="1:1078">
            From complex corporate filings to monthly QuickBooks reconciliations, we deliver precision, proactive deductions, and ironclad compliance.
          </p>
        </div>

        {/* Tab Filters (Node 1:1079) */}
        <div 
          className="bg-[#e8e8e8] p-[4px] rounded-[30px] flex flex-wrap items-center justify-center max-w-full overflow-x-auto" 
          data-node-id="1:1079"
        >
          {tabOptions.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-w-[60px] px-3.5 xl:px-4 2xl:px-[20px] py-2 xl:py-2.5 2xl:py-[12px] rounded-[26px] text-xs sm:text-sm xl:text-[14px] 2xl:text-[16px] leading-[22px] 2xl:leading-[24px] cursor-pointer whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white font-semibold text-[#111111] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)]'
                    : 'font-normal text-[#111111] hover:text-[#0094c5]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid (Node 1:1092) */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-5 2xl:gap-[20px] drop-shadow-[0px_0px_30px_rgba(0,0,0,0.1)]" data-node-id="1:1092">
          {visibleCards.map((card) => (
            <div 
              key={card.id}
              className="bg-white rounded-[20px] overflow-hidden flex flex-col justify-between border border-[#e8e8e8] shadow-[0px_0px_4px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-300"
              data-node-id={card.nodeId}
            >
              {/* Card Banner */}
              <div className={`h-[160px] w-full ${card.bannerBg} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img 
                    alt={card.title} 
                    className={`absolute ${card.imageHeight} left-0 top-0 w-full object-cover`} 
                    src={card.image} 
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 xl:p-[18px] 2xl:p-[20px] flex flex-col gap-4 sm:gap-6 2xl:gap-[30px] flex-1 justify-between">
                <div className="flex flex-col gap-2 2xl:gap-[10px]">
                  <h3 className="font-semibold text-lg sm:text-xl xl:text-[19px] 2xl:text-[24px] text-black leading-normal">
                    {card.title}
                  </h3>
                  <p className="font-medium text-xs sm:text-sm xl:text-[13.5px] 2xl:text-[16px] text-black leading-relaxed xl:leading-[21px] 2xl:leading-[24px]">
                    {card.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 2xl:gap-[10px]">
                  {card.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2.5 2xl:gap-[14px] items-center">
                      <div className="relative shrink-0 size-4 sm:size-5 2xl:size-[20px]">
                        <img alt="" className="size-full" src={imgCheck} />
                      </div>
                      <p className="font-medium text-xs sm:text-sm xl:text-[13.5px] 2xl:text-[16px] text-black leading-snug xl:leading-[21px] 2xl:leading-[24px]">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-1 2xl:pt-2">
                  <a 
                    href="#contact"
                    className="inline-flex gap-2 2xl:gap-[10px] items-center font-bold text-xs sm:text-sm xl:text-[14px] 2xl:text-[16px] text-[#0094c5] hover:text-[#0074bc] transition-colors group cursor-pointer"
                  >
                    <span>{card.ctaText}</span>
                    <div className="relative shrink-0 size-4 sm:size-5 2xl:size-[24px] group-hover:translate-x-1 transition-transform">
                      <img alt="" className="size-full" src={imgArrowRight} />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* 6th Card: Track on the Go Mobile App Card (Node 1:1205) */}
          {showAppCard && (
            <div 
              className="bg-white rounded-[20px] overflow-hidden flex flex-col sm:flex-row border border-[#e8e8e8] shadow-[0px_0px_4px_rgba(0,0,0,0.06)] min-h-[467px]"
              data-node-id="1:1205"
            >
              {/* Left Column (Node 1:1206) */}
              <div className="p-5 sm:p-6 xl:p-[18px] 2xl:p-[20px] flex flex-col justify-between gap-5 sm:gap-6 2xl:gap-[40px] flex-1">
                <div className="flex flex-col gap-2 2xl:gap-[10px]">
                  <h3 className="font-bold text-lg sm:text-xl xl:text-[19px] 2xl:text-[24px] text-black leading-normal" data-node-id="1:1208">
                    Track on the go
                  </h3>
                  <p className="font-medium text-xs sm:text-sm xl:text-[13.5px] 2xl:text-[16px] text-black leading-relaxed xl:leading-[21px] 2xl:leading-[24px]" data-node-id="1:1209">
                    Use our mobile app to track your filing status, contact with your preparer and more insights.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-[10px] items-center" data-node-id="1:1210">
                  {/* QR Code */}
                  <div className="relative shrink-0 size-[110px] 2xl:size-[130px] rounded-xl border border-black/5 p-1 bg-white" data-node-id="1:1211">
                    <img alt="QR Code" className="size-full" src={imgAdobeExpressQrCode1} />
                  </div>

                  {/* Store download buttons (Node 1:1559) */}
                  <div className="flex flex-col gap-[16px] 2xl:gap-[19.2px] items-start justify-center" data-node-id="1:1559">
                    {/* App Store */}
                    <a 
                      href="#" 
                      className="bg-white border-[1.037px] border-black flex gap-[8.294px] h-[48.384px] items-center justify-center px-[10.368px] rounded-[10.368px] w-[129.6px] hover:bg-black/5 transition-colors cursor-pointer" 
                      data-node-id="1:1560"
                    >
                      <div className="h-[24.883px] w-[20.736px] shrink-0" data-node-id="1:1561">
                        <img alt="Apple" className="size-full" src={imgGroup6894} />
                      </div>
                      <div className="flex flex-col h-[27.648px] items-start leading-none text-black" data-node-id="1:1564">
                        <span className="text-[9.331px] font-medium leading-[9.331px]">Download on the</span>
                        <span className="text-[18.662px] font-medium tracking-[-0.4873px] leading-tight mt-0.5">App Store</span>
                      </div>
                    </a>

                    {/* Google Play */}
                    <a 
                      href="#" 
                      className="bg-white border-[1.037px] border-black flex gap-[7.258px] h-[48.384px] items-center justify-center px-[10.368px] rounded-[10.368px] w-[129.6px] hover:bg-black/5 transition-colors cursor-pointer" 
                      data-node-id="1:1567"
                    >
                      <div className="h-[24.883px] w-[21.772px] shrink-0" data-node-id="1:1568">
                        <img alt="Google Play" className="size-full" src={imgGroup6893} />
                      </div>
                      <div className="flex flex-col gap-[3.11px] items-start leading-none text-black" data-node-id="1:1573">
                        <span className="text-[9.331px] font-normal uppercase">GET IT ON</span>
                        <div className="h-[15.552px] w-[76.723px]" data-name="path90">
                          <img alt="Google Play" className="size-full" src={imgPath90} />
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column with App Screenshots (Node 1:1576) */}
              <div 
                className="bg-[rgba(0,148,197,0.1)] w-full sm:w-[300px] 2xl:w-[442px] h-[320px] sm:h-auto 2xl:h-[467px] relative overflow-hidden shrink-0" 
                data-node-id="1:1576"
              >
                <div className="relative w-full h-full min-h-[320px]" data-node-id="1:1577">
                  {/* Image 17 */}
                  <img 
                    alt="App Screen 1" 
                    className="absolute rounded-[20px] 2xl:rounded-[24px] object-cover shadow-2xl left-[20px] top-[30px] w-[135px] h-[295px] 2xl:left-[61px] 2xl:top-[47px] 2xl:w-[171px] 2xl:h-[373px]" 
                    src={imgImage17} 
                    data-node-id="1:1578"
                  />
                  {/* Image 18 */}
                  <img 
                    alt="App Screen 2" 
                    className="absolute rounded-[16px] 2xl:rounded-[18px] object-cover shadow-xl left-[165px] top-[75px] w-[105px] h-[225px] 2xl:left-[253px] 2xl:top-[95px] 2xl:w-[128px] 2xl:h-[277px]" 
                    src={imgImage18} 
                    data-node-id="1:1579"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
