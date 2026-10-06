import { useState } from 'react';

// Exact Figma Avatar images from media_0.png and node 1:1686
const imgAvatar1 = "/figma/0a4b11473240ff5a19a7a51cc2920133cf790b96.png";
const imgAvatar2 = "/figma/1f2a595e337438d816a3ca15f9c2a1ed48f089f7.png";
const imgAvatar3 = "/figma/63b583af71dbb886dd739918bb653a159e4e05fd.png";
const imgAvatarCenter = "/figma/8b49a6fff1d9c25a16fc8fc858f9f5efa2eac43e.png";
const imgAvatar5 = "/figma/0a4b11473240ff5a19a7a51cc2920133cf790b96.png";
const imgAvatar6 = "/figma/1ebbe83a4475669abd9f04543e63db83fd9f3023.png";
const imgAvatar7 = "/figma/63b583af71dbb886dd739918bb653a159e4e05fd.png";

const imgArrowRight = "/figma/78547e274309ef33a2b93c9ab4e79cfff4288c3f.svg";
const imgVector4 = "/figma/ba7ff9da3f36f0e57d5d884161e5e73388ece3f1.svg";

const reviews = [
  {
    quote: '“I can’t say enough great things about your tax firm TAXMAX. Tax season used to be a hassle. But ever since we switched to them, everything has been a breeze. They are very knowledgeable and professional.”',
    author: 'Billy Boleman Jr.',
    role: 'Small Business Owner • Minneapolis, MN',
    centerAvatar: imgAvatarCenter
  },
  {
    quote: '“TAXMAX restructured our corporate filings and optimized our multi-state returns. We saved over $35,000 in legitimate deductions in our first year alone. Their response time is exceptional.”',
    author: 'Sarah Jenkins',
    role: 'Managing Partner, NorthStar Design • St. Paul, MN',
    centerAvatar: imgAvatar2
  },
  {
    quote: '“Having TAXMAX handle our monthly bookkeeping, payroll, and corporate compliance gives me complete peace of mind. Truly a year-round partner you can count on.”',
    author: 'Marcus Vance',
    role: 'General Contractor • Bloomington, MN',
    centerAvatar: imgAvatar3
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

  const current = reviews[index];

  return (
    <section 
      id="reviews" 
      className="w-full bg-[#eef8fb] py-16 sm:py-20 xl:py-[100px] 2xl:py-[130px] 3xl:py-[200px] overflow-hidden" 
      data-node-id="1:1678"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] flex flex-col gap-10 sm:gap-14 2xl:gap-16 3xl:gap-[100px] items-center">
        
        {/* Section Header (Node 1:1679) */}
        <div className="flex flex-col gap-2 2xl:gap-[8px] 3xl:gap-[10px] items-center text-center max-w-[1400px] w-full" data-node-id="1:1679">
          <h2 className="font-bold text-[23px] sm:text-[29px] xl:text-[33px] 2xl:text-[39px] 3xl:text-[46px] tracking-tight leading-tight xl:leading-[44px] 2xl:leading-[50px] 3xl:leading-[60px] text-black w-full" data-node-id="1:1680">
            Trusted by Minnesota Businesses &amp; Families
          </h2>
          <p className="font-medium text-[13px] sm:text-[15px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[18px] leading-relaxed xl:leading-[24px] 2xl:leading-[27px] 3xl:leading-[32px] text-black w-full" data-node-id="1:1681">
            Read verified reviews from clients who rely on TAXMAX Consulting for their corporate taxes, payroll, and personal returns.
          </p>
        </div>

        {/* Carousel Container (Node 1:1682) */}
        <div className="w-full flex items-center justify-center gap-3 sm:gap-6 xl:gap-[32px] 2xl:gap-[48px] 3xl:gap-[100px] relative" data-node-id="1:1682">
          
          {/* Previous Button (Node 1:1683) */}
          <button
            type="button"
            onClick={prev}
            className="size-11 sm:size-13 xl:size-[56px] 2xl:size-[62px] 3xl:size-[72px] rounded-full bg-[#d6f0f8] hover:bg-[#c3eaf4] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm hover:shadow active:scale-95"
            aria-label="Previous review"
            data-node-id="1:1683"
          >
            <div className="size-5 sm:size-7 xl:size-[30px] 2xl:size-[34px] 3xl:size-[40px] rotate-180 flex items-center justify-center">
              <img alt="Previous" className="size-full" src={imgArrowRight} />
            </div>
          </button>

          {/* Testimonial Core Content (Node 1:1685) */}
          <div className="flex flex-col gap-4 sm:gap-6 2xl:gap-[30px] items-center max-w-[832px] w-full flex-1 text-center" data-node-id="1:1685">
            
            {/* 7 Avatars Row with exact Figma sizes & vertical centering (Node 1:1686) */}
            <div 
              className="flex items-center justify-center gap-1.5 sm:gap-3 xl:gap-[20px] 2xl:gap-[28px] 3xl:gap-[40px] h-[90px] 2xl:h-[95px] 3xl:h-[100px] w-full max-w-[640px] mx-auto select-none" 
              data-node-id="1:1686"
            >
              {/* Avatar 1 (30px) */}
              <div className="size-5 sm:size-[24px] 2xl:size-[26px] 3xl:size-[30px] rounded-full overflow-hidden shrink-0" data-node-id="1:1687">
                <img alt="" className="size-full object-cover" src={imgAvatar1} />
              </div>

              {/* Avatar 2 (50px) */}
              <div className="size-8 sm:size-[40px] 2xl:size-[44px] 3xl:size-[50px] rounded-full overflow-hidden shrink-0" data-node-id="1:1688">
                <img alt="" className="size-full object-cover" src={imgAvatar2} />
              </div>

              {/* Avatar 3 (70px) */}
              <div className="size-10 sm:size-[56px] 2xl:size-[62px] 3xl:size-[70px] rounded-full overflow-hidden shrink-0" data-node-id="1:1689">
                <img alt="" className="size-full object-cover" src={imgAvatar3} />
              </div>

              {/* Avatar 4: Active Center Spotlight (100px) */}
              <div 
                className="size-14 sm:size-18 xl:size-[80px] 2xl:size-[88px] 3xl:size-[100px] rounded-full overflow-hidden shrink-0 border-[3px] 3xl:border-4 border-[#0094c5] shadow-[0px_16px_60px_0px_rgba(0,148,197,0.35)] transition-transform duration-300 ring-4 ring-[#0094c5]/20" 
                data-node-id="1:1690"
              >
                <img alt="" className="size-full object-cover" src={current.centerAvatar} />
              </div>

              {/* Avatar 5 (70px) */}
              <div className="size-10 sm:size-[56px] 2xl:size-[62px] 3xl:size-[70px] rounded-full overflow-hidden shrink-0" data-node-id="1:1691">
                <img alt="" className="size-full object-cover" src={imgAvatar5} />
              </div>

              {/* Avatar 6 (50px) */}
              <div className="size-8 sm:size-[40px] 2xl:size-[44px] 3xl:size-[50px] rounded-full overflow-hidden shrink-0" data-node-id="1:1692">
                <img alt="" className="size-full object-cover" src={imgAvatar6} />
              </div>

              {/* Avatar 7 (30px) */}
              <div className="size-5 sm:size-[24px] 2xl:size-[26px] 3xl:size-[30px] rounded-full overflow-hidden shrink-0" data-node-id="1:1693">
                <img alt="" className="size-full object-cover" src={imgAvatar7} />
              </div>
            </div>

            {/* Testimonial Quote (Node 1:1694) */}
            <blockquote className="font-medium text-[15px] sm:text-[19px] xl:text-[21px] 2xl:text-[25px] 3xl:text-[30px] text-black leading-snug sm:leading-relaxed xl:leading-[34px] 2xl:leading-[40px] 3xl:leading-[50px] max-w-[832px] mx-auto min-h-[90px] 3xl:min-h-[100px] flex items-center justify-center transition-all duration-300" data-node-id="1:1694">
              {current.quote}
            </blockquote>

            {/* Vector 4 Divider Line (Node 1:1695) */}
            <div className="w-full max-w-[832px] h-0 relative my-1 sm:my-2" data-node-id="1:1695">
              <img alt="" className="block max-w-none w-full" src={imgVector4} />
            </div>

            {/* Author and Role (Node 1:1696) */}
            <div className="flex flex-col gap-1 items-center text-center" data-node-id="1:1696">
              <p className="font-bold text-[13px] xl:text-[14px] 2xl:text-[14.5px] 3xl:text-[14px] leading-[22px] text-[#111111]" data-node-id="1:1697">
                {current.author}
              </p>
              <p className="font-normal text-[11px] xl:text-[12px] 2xl:text-[12.5px] 3xl:text-[12px] leading-[24px] opacity-80 text-[#111111]" data-node-id="1:1698">
                {current.role}
              </p>
            </div>

          </div>

          {/* Next Button (Node 1:1699) */}
          <button
            type="button"
            onClick={next}
            className="size-11 sm:size-13 xl:size-[56px] 2xl:size-[62px] 3xl:size-[72px] rounded-full bg-[#d6f0f8] hover:bg-[#c3eaf4] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm hover:shadow active:scale-95"
            aria-label="Next review"
            data-node-id="1:1699"
          >
            <div className="size-5 sm:size-7 xl:size-[30px] 2xl:size-[34px] 3xl:size-[40px] flex items-center justify-center" data-node-id="1:1700">
              <img alt="Next" className="size-full" src={imgArrowRight} />
            </div>
          </button>

        </div>

      </div>
    </section>
  );
}
