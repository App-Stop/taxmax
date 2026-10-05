import { useState } from 'react';

const imgX = "/figma/9b089f603c26706a10250c5bf691ff81010e1b92.svg";
const imgPlus = "/figma/9d798d62c4f63ecae56130eecc07426bce496b63.svg";

const faqItems = [
  {
    question: 'What documents do I need to prepare for my tax return?',
    answer: 'For individuals, we require W-2s, 1099s, mortgage interest (Form 1098), charitable donations, and your prior year tax return. For businesses, we also require your year-end Profit & Loss statement, Balance Sheet, bank/credit card reconciliation statements, and ownership change records.',
    nodeId: '1:1737'
  },
  {
    question: 'How does TAXMAX help if I received an IRS or State audit letter?',
    answer: 'We act as your authorized representative before the IRS and the Minnesota Department of Revenue under IRS Form 2848 (Power of Attorney). We correspond directly with agents, submit documentation, defend allowable deductions, and negotiate penalty abatements so you never have to face the IRS alone.',
    nodeId: '1:1743'
  },
  {
    question: 'Can I file my taxes completely online without visiting the office?',
    answer: 'Yes! 100% of our tax filing, bookkeeping, and advisory services can be handled virtually through our encrypted, bank-grade client portal. You can securely upload photos or scans of your documents, collaborate with your preparer, and e-sign from any device.',
    nodeId: '1:1748'
  },
  {
    question: 'What is included in your monthly bookkeeping and QuickBooks services?',
    answer: 'Our monthly bookkeeping services cover complete QuickBooks Online ledger setup and cleanup, monthly bank and credit card reconciliations, vendor 1099 tracking, and monthly Balance Sheet & Profit & Loss statements prepared for immediate tax readiness.',
    nodeId: '1:1753'
  },
  {
    question: 'When are business tax returns due for S-Corporations and Partnerships?',
    answer: 'For calendar-year S-Corporations (Form 1120-S) and Partnerships (Form 1065), federal tax returns are due March 15th. For C-Corporations (Form 1120) and individual returns (Form 1040), the deadline is April 15th. We can also handle 6-month extension filings if needed.',
    nodeId: '1:1758'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // Item 0 is open by default as in Figma

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faqs" className="w-full bg-white py-16 sm:py-20 xl:py-[80px] 2xl:py-[100px]" data-node-id="1:1727">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-[160px]">
        <div className="flex flex-col xl:flex-row gap-10 xl:gap-12 2xl:gap-[70px] items-start">
          
          {/* Left Column (Node 1:1728) */}
          <div className="flex flex-col gap-6 xl:gap-8 2xl:gap-[60px] items-start flex-1 min-w-0" data-node-id="1:1728">
            <div className="flex flex-col gap-[10px] items-start text-[#111111] w-full" data-node-id="1:1729">
              <h2 className="font-bold text-2xl sm:text-3xl xl:text-[28px] 2xl:text-[36px] tracking-tight leading-tight xl:leading-[38px] 2xl:leading-[50px]" data-node-id="1:1730">
                Frequently Asked Questions
              </h2>
              <p className="font-medium text-sm sm:text-base xl:text-[15px] 2xl:text-[20px] leading-relaxed xl:leading-[24px] 2xl:leading-[32px] text-[#111111]" data-node-id="1:1731">
                Clear answers about our tax preparation, audit representation, and bookkeeping services.
              </p>
            </div>

            <div className="flex flex-col gap-[10px] items-start" data-node-id="1:1732">
              <p className="font-medium text-base xl:text-[16px] 2xl:text-[20px] leading-normal xl:leading-[26px] 2xl:leading-[32px] text-[#111111]" data-node-id="1:1733">
                Need to know something else?
              </p>
              <a 
                href="#contact"
                className="bg-transparent border border-[#0094c5] hover:bg-[#0094c5]/5 px-5 py-3 xl:px-5 xl:py-3.5 2xl:px-[24px] 2xl:py-[16px] rounded-[100px] font-bold text-sm xl:text-[14px] 2xl:text-[16px] text-[#0094c5] transition-colors cursor-pointer text-center"
                data-node-id="1:1734"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Right Column: Accordion Items (Node 1:1736) */}
          <div className="flex flex-col gap-3 sm:gap-4 2xl:gap-[20px] items-start w-full xl:w-[680px] 2xl:w-[900px] shrink-0" data-node-id="1:1736">
            {faqItems.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-[#f5f5f5] p-4 sm:p-5 2xl:p-[20px] rounded-[20px] w-full flex gap-4 2xl:gap-[20px] items-start transition-all cursor-pointer select-none"
                  onClick={() => toggle(idx)}
                  data-node-id={item.nodeId}
                >
                  <div className="flex flex-col gap-2 2xl:gap-[10px] items-start flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base xl:text-[15px] 2xl:text-[16px] leading-normal text-[#111111]">
                      {item.question}
                    </p>
                    {isOpen && (
                      <p className="font-normal text-xs sm:text-sm xl:text-[14px] 2xl:text-[16px] leading-relaxed xl:leading-[22px] 2xl:leading-[24px] opacity-80 text-[#111111] animate-in fade-in duration-200">
                        {item.answer}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#e8e8e8] p-[6px] rounded-full shrink-0 flex items-center justify-center">
                    <div className="size-[18px] 2xl:size-[20px] relative">
                      <img 
                        alt={isOpen ? "Collapse" : "Expand"} 
                        className="size-full" 
                        src={isOpen ? imgX : imgPlus} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
