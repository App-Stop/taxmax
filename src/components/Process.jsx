const imgVector4 = "/figma/ad045c0ffcd5ae30bb134f369a9df3a00a4e5327.svg";
const imgMonitorArrowUp = "/figma/2c58569c9c25925910df3d69a616cac3e8e53278.svg";
const imgFiles = "/figma/cf64da49f98347b44496afdddfd52030c9b27d9c.svg";
const imgListChecks = "/figma/fb748ab7ad4474be7e769fd03e6e4864062c98f6.svg";

const steps = [
  {
    number: '1',
    title: 'Secure Document Upload',
    description: 'Upload your W-2s, 1099s, and financial reports through our encrypted portal. We automatically detect and organize your documents.',
    icon: imgMonitorArrowUp,
    nodeId: '1:992'
  },
  {
    number: '2',
    title: 'In-Depth Deduction Audit',
    description: 'Our specialists review your documents against 400+ IRS tax code provisions to uncover all eligible credits and deductions.',
    icon: imgFiles,
    nodeId: '1:997'
  },
  {
    number: '3',
    title: 'Optimization Walkthrough',
    description: 'We review your draft return together, explaining line items, tax-saving tactics, and proactive plans for the upcoming year.',
    icon: imgListChecks,
    nodeId: '1:1002'
  },
  {
    number: '4',
    title: 'IRS E-File & Year-Round Shield',
    description: 'At last, we submit your return electronically with immediate IRS confirmation, keeping you fully protected under our audit shield.',
    icon: imgMonitorArrowUp,
    nodeId: '1:1007'
  }
];

export default function Process() {
  return (
    <section 
      id="process"
      className="relative w-full bg-gradient-to-r from-[#0d1d35] via-1/2 via-[#132d54] to-[#0d1d35] py-16 sm:py-24 xl:py-[120px] overflow-hidden" 
      data-node-id="1:987"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-[160px] flex flex-col gap-10 xl:gap-[60px] items-center relative">
        
        {/* Title (Node 1:989) */}
        <h2 className="font-bold text-2xl sm:text-3xl xl:text-[34px] 2xl:text-[48px] text-white text-center tracking-tight leading-tight xl:leading-[44px] 2xl:leading-[60px]" data-node-id="1:989">
          Four Steps to Stress-Free Tax Filing
        </h2>

        {/* Process Structure (Node 1:990) */}
        <div className="w-full flex flex-col gap-6 xl:gap-[30px] items-start relative" data-node-id="1:990">
          
          {/* Connecting Vector Line (Node 1:988) behind number circles on 2xl */}
          <div className="hidden 2xl:block absolute left-[185px] right-[185px] top-[272px] translate-y-[29px] h-0 pointer-events-none z-0">
            <div className="w-full h-0 relative">
              <img alt="" className="w-full block" src={imgVector4} />
            </div>
          </div>

          {/* Cards Row (Node 1:991) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-5 2xl:gap-[40px] items-stretch w-full z-10" data-node-id="1:991">
            {steps.map((step) => (
              <div 
                key={step.number}
                className="bg-[rgba(0,148,197,0.1)] p-5 sm:p-6 xl:p-[20px] 2xl:p-[30px] rounded-[20px] flex flex-col gap-4 2xl:gap-[20px] justify-between border border-transparent hover:border-[#0094c5]/30 transition-all duration-300"
                data-node-id={step.nodeId}
              >
                <div className="flex gap-4 2xl:gap-[30px] items-start justify-between w-full">
                  <h3 className="font-bold text-base sm:text-lg xl:text-[18px] 2xl:text-[24px] text-white leading-normal flex-1">
                    {step.title}
                  </h3>
                  <div className="relative shrink-0 size-[32px] 2xl:size-[40px]">
                    <img alt="" className="size-full" src={step.icon} />
                  </div>
                </div>

                <p className="font-normal text-xs sm:text-sm xl:text-[13.5px] 2xl:text-[16px] text-white opacity-80 leading-relaxed xl:leading-[20px] 2xl:leading-[24px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Number Badges Row (Node 1:1012) */}
          <div className="hidden xl:grid grid-cols-4 gap-5 2xl:gap-[40px] w-full z-10" data-node-id="1:1012">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center justify-center w-full">
                <div 
                  className="backdrop-blur-[30px] bg-[rgba(0,148,197,0.1)] border border-white/20 size-[48px] 2xl:size-[60px] rounded-[100px] flex items-center justify-center font-extrabold text-[18px] 2xl:text-[24px] text-white text-center leading-none shadow-lg shadow-black/20"
                >
                  {step.number}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
