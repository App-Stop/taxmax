const imgImage10 = "/figma/747a800abe4419cfac08ab1320d3df5aa00fff2f.png";
const imgArrowUpRight = "/figma/9ef5d81feac92affef85c0d4afd5f2158d45e614.svg";

export default function IrsEstimates() {
  return (
    <section 
      id="estimator"
      className="w-full bg-[#f5f5f5] py-14 sm:py-16 md:py-20 xl:py-[70px] 3xl:py-[80px]" 
      data-node-id="36:877"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px]">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-8 xl:gap-[60px] 3xl:gap-[80px] items-center justify-between">
          
          {/* Left Content (Node 36:878) */}
          <div className="w-full lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[670px] 3xl:max-w-[714px] flex-1 flex flex-col gap-6 sm:gap-8 xl:gap-[32px] 3xl:gap-[40px] items-start" data-node-id="36:878">
            <div className="flex flex-col gap-4 3xl:gap-[20px] items-start w-full text-[#111111]" data-node-id="36:879">
              <h2 
                className="font-bold text-[28px] sm:text-[34px] xl:text-[38px] 2xl:text-[42px] 3xl:text-[48px] text-[#111111] tracking-[-1px] leading-[1.2] xl:leading-[50px] 3xl:leading-[60px]"
                data-node-id="36:880"
              >
                Get Tax Estimates &amp; <br className="hidden sm:inline" />Information from the IRS
              </h2>
              <p 
                className="font-medium text-[15px] sm:text-[17px] xl:text-[18px] 2xl:text-[19px] 3xl:text-[20px] text-[#111111] leading-relaxed xl:leading-[28px] 3xl:leading-[32px]"
                data-node-id="36:881"
              >
                Visit the official IRS website for tax estimation tools, filing guidance, and other helpful tax information.
              </p>
            </div>

            {/* CTA Button (Node 36:882) */}
            <a 
              href="https://www.irs.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-[10px] bg-[#0094c5] hover:bg-[#0074bc] border border-white/10 px-5 sm:px-6 py-3 sm:py-3.5 3xl:px-[24px] 3xl:py-[16px] rounded-full text-white font-extrabold text-[16px] xl:text-[18px] 3xl:text-[20px] transition-all shadow-md hover:shadow-cyan-500/20 cursor-pointer"
              data-node-id="36:882"
            >
              <span className="whitespace-nowrap leading-normal" data-node-id="36:883">
                Visit IRS
              </span>
              <div className="relative shrink-0 size-[20px] 3xl:size-[24px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" data-node-id="36:884">
                <img alt="" className="size-full" src={imgArrowUpRight} />
              </div>
            </a>
          </div>

          {/* Right Image Container (Node 36:885) */}
          <div 
            className="w-full lg:w-[480px] xl:w-[600px] 2xl:w-[700px] 3xl:w-[806px] aspect-[806/447] relative rounded-[20px] overflow-hidden" 
            data-node-id="36:885"
          >
            <img 
              alt="IRS Tax Estimates & Guidance" 
              className="w-full h-full object-cover rounded-[20px]" 
              src={imgImage10} 
            />
          </div>

        </div>
      </div>
    </section>
  );
}
