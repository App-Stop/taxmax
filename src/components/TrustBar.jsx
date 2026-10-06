const imgCertificate = "/figma/c98d8839eb368bb7be9fc8b19d5c60b73a3527c2.svg";
const imgAsterisk = "/figma/d7a7384c5f045828f1077848dcd1040bdadd5b85.svg";
const imgGavel = "/figma/a01ef2ff50d6f4a2ea844854bf83f1940033bc6c.svg";
const imgPinhead = "/figma/63f040f9ac9bb0faf6f756d5e31799d5d76100d7.svg";

const trustItems = [
  {
    icon: imgCertificate,
    title: 'IRS Certified',
    nodeId: '1:961'
  },
  {
    icon: imgAsterisk,
    title: 'Years in Service',
    nodeId: '1:964'
  },
  {
    icon: imgGavel,
    title: 'AICPA Standards',
    nodeId: '1:967'
  },
  {
    icon: imgPinhead,
    title: 'Local & Nation Wide',
    nodeId: '1:970'
  }
];

export default function TrustBar() {
  return (
    <section className="w-full bg-[#f5f5f5]" data-node-id="1:960">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] py-[20px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-[20px] items-center justify-between">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col gap-[10px] items-start justify-center flex-1 min-w-0"
              data-node-id={item.nodeId}
            >
              <div className="relative shrink-0 size-[32px] 2xl:size-[36px] 3xl:size-[40px]">
                <img alt={item.title} className="size-full" src={item.icon} />
              </div>
              <p className="font-semibold text-[15px] sm:text-[17px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[22px] text-[#111111] leading-normal whitespace-nowrap">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
