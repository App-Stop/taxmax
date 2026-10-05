const imgArrowRight = "/figma/8720f639cc94615397c005e94229b1e3166db1bb.svg";

const tools = [
  {
    title: 'Track Your Tax Refund',
    description: 'Wondering where your tax refund is? Check the live processing status directly with the IRS and the Minnesota Department of Revenue.',
    cta: 'Track my refund',
    href: 'https://www.irs.gov/refunds',
    nodeId: '1:1706'
  },
  {
    title: '2026 Important Tax Deadlines',
    description: 'Stay ahead of penalty dates. Here are the official IRS filing and estimated payment dates you need to mark on your calendar:',
    cta: 'View',
    href: '#estimator',
    nodeId: '1:1713'
  },
  {
    title: 'Tax Record Retention Guide',
    description: '"When in doubt, don\'t throw it out." Federal law requires keeping documentation, but how long should you hold onto records?',
    cta: 'View',
    href: '#faqs',
    nodeId: '1:1720'
  }
];

export default function FreeTools() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 xl:py-[70px] 2xl:py-[80px]" data-node-id="1:1701">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 2xl:px-[160px]">
        <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 2xl:gap-[70px] items-start xl:items-center">
          
          {/* Left Title and Subtitle (Node 1:1702) */}
          <div className="flex flex-col gap-2 sm:gap-[10px] items-start text-[#111111] flex-1 min-w-0" data-node-id="1:1702">
            <h2 className="font-bold text-2xl sm:text-3xl xl:text-[28px] 2xl:text-[36px] tracking-tight leading-tight xl:leading-[38px] 2xl:leading-[50px]" data-node-id="1:1703">
              Free Tax Tools, Deadlines &amp; Record Retention Guide
            </h2>
            <p className="font-medium text-sm sm:text-base xl:text-[15px] 2xl:text-[20px] leading-relaxed xl:leading-[24px] 2xl:leading-[32px] text-[#111111]" data-node-id="1:1704">
              Essential resources to track your refund status, stay ahead of IRS deadlines, and know exactly what paperwork to keep.
            </p>
          </div>

          {/* Right Cards Row (Node 1:1705) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-4 2xl:gap-[20px] w-full xl:w-auto shrink-0" data-node-id="1:1705">
            {tools.map((tool) => (
              <div 
                key={tool.title}
                className="bg-[#f5f5f5] p-4 sm:p-5 2xl:p-[20px] rounded-[20px] flex flex-col justify-between gap-4 2xl:gap-[20px] w-full xl:w-[250px] 2xl:w-[324px] border border-transparent hover:border-[#0094c5]/20 transition-all shadow-sm"
                data-node-id={tool.nodeId}
              >
                <div className="flex flex-col gap-2 2xl:gap-[10px] items-start text-[#111111] w-full">
                  <h3 className="font-semibold text-base xl:text-[16px] 2xl:text-[20px] leading-normal text-[#111111]">
                    {tool.title}
                  </h3>
                  <p className="font-normal text-xs xl:text-[13px] 2xl:text-[16px] leading-relaxed xl:leading-[20px] 2xl:leading-[24px] opacity-80 text-[#111111]">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-1 2xl:pt-2">
                  <a 
                    href={tool.href}
                    target={tool.href.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="inline-flex gap-2 2xl:gap-[10px] items-center justify-center font-bold text-xs xl:text-[14px] 2xl:text-[16px] text-[#0094c5] hover:text-[#0074bc] transition-colors group cursor-pointer"
                  >
                    <span>{tool.cta}</span>
                    <div className="relative shrink-0 size-4 sm:size-5 2xl:size-[24px] group-hover:translate-x-1 transition-transform">
                      <img alt="" className="size-full" src={imgArrowRight} />
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
