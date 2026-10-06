const statsData = [
  {
    value: 'Decades',
    label: 'Of Continuous Tax & Advisory Excellence',
    nodeId: '1:975'
  },
  {
    value: '18M+',
    label: 'Legitimate Tax Deductions & Credits Unlocked',
    nodeId: '1:978'
  },
  {
    value: '10,000+',
    label: 'Federal & State Returns Successfully E-Filed',
    nodeId: '1:981'
  },
  {
    value: '99.4%',
    label: 'Annual Client Retention & Satisfaction Rate',
    nodeId: '1:984'
  }
];

export default function Stats() {
  return (
    <section 
      className="w-full bg-gradient-to-r from-[#007aaf] via-[#0093d2] to-[#007aaf] py-12 xl:py-[60px] text-white text-center"
      data-node-id="1:974"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 xl:gap-[20px] items-center">
          {statsData.map((stat, idx) => (
            <div 
              key={idx} 
              className="flex flex-col gap-1 sm:gap-2 2xl:gap-2 3xl:gap-[10px] items-center justify-center flex-1"
              data-node-id={stat.nodeId}
            >
              <div className="font-extrabold text-[23px] sm:text-[29px] xl:text-[35px] 2xl:text-[41px] 3xl:text-[46px] leading-normal whitespace-nowrap">
                {stat.value}
              </div>
              <p className="font-medium text-[11px] sm:text-[13px] xl:text-[12px] 2xl:text-[13.5px] 3xl:text-[14px] leading-tight sm:leading-snug 2xl:leading-[20px] 3xl:leading-[22px] w-full max-w-[200px] 2xl:max-w-[220px] text-white">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
