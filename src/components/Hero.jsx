const imgHeroTeam1 = "/figma/b6e15fff650907710610d8ab75a5aa4b7223fb03.png";
const imgTarget = "/figma/4e5deb9401d609b839325b7bfb124c1af8ae1f28.svg";
const imgShieldCheck = "/figma/ae59e51ca32ea02da1127cafd146ed32bbcfcc55.svg";
const imgEllipse6 = "/figma/ab80d930e6fc3ea074aec8e014f1edeb11fa2740.svg";
const imgArrowRight = "/figma/0836a6f58bee20c26ca9f18c84ce1cb5e104a898.svg";
const imgArrowUpRight = "/figma/e70bb31ffcfb9ae7f5845d4c3a2aa42e1a338288.svg";
const imgVector4 = "/figma/e4529a2be9637e421bc59d7406a2aa8b89b8ddb1.svg";
const imgAvatar1 = "/figma/1f2a595e337438d816a3ca15f9c2a1ed48f089f7.png";
const imgAvatar2 = "/figma/8b49a6fff1d9c25a16fc8fc858f9f5efa2eac43e.png";
const imgAvatar3 = "/figma/0a4b11473240ff5a19a7a51cc2920133cf790b96.png";

export default function Hero() {
  return (
    <section className="relative w-full bg-[#05162e] min-h-[640px] xl:min-h-[720px] 2xl:min-h-[800px] 3xl:h-[800px] overflow-hidden" data-node-id="1:927">
      {/* Background Container matching Frame 2085663478 */}
      <div className="absolute inset-0 size-full pointer-events-none overflow-hidden" data-node-id="1:928">
        {/* Hero Background Team Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            alt="TAXMAX Advisors" 
            className="absolute h-full xl:h-[99.91%] left-0 xl:left-[-8.75%] max-w-none top-0 xl:top-[0.07%] w-full xl:w-[127.51%] object-cover object-[65%_center] xl:object-center" 
            src={imgHeroTeam1} 
          />
        </div>
        
        {/* Figma Exact Gradient Overlay */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: "linear-gradient(270deg, rgba(19, 37, 64, 0.1) 27.359%, rgba(19, 37, 64, 0.106) 30.981%, rgba(19, 37, 64, 0.122) 34.139%, rgba(19, 37, 64, 0.148) 36.911%, rgba(19, 37, 64, 0.184) 39.375%, rgba(19, 37, 64, 0.228) 41.609%, rgba(19, 37, 64, 0.28) 43.691%, rgba(19, 37, 64, 0.34) 45.698%, rgba(19, 37, 64, 0.406) 47.708%, rgba(19, 37, 64, 0.478) 49.799%, rgba(19, 37, 64, 0.556) 52.049%, rgba(19, 37, 64, 0.638) 54.535%, rgba(19, 37, 64, 0.724) 57.335%, rgba(19, 37, 64, 0.814) 60.527%, rgba(19, 37, 64, 0.906) 64.189%, rgb(5, 22, 46) 77.566%)" 
          }} 
        />

        {/* Ellipse 6 Glow */}
        <div className="absolute left-[-9px] size-[718px] top-[-260px] opacity-80" data-node-id="1:937">
          <div className="absolute inset-[-34.82%]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse6} />
          </div>
        </div>

        {/* Floating Stat Card 1 (IRS Accuracy Rate) */}
        <div 
          className="hidden xl:flex absolute backdrop-blur-[10px] bg-[rgba(15,39,61,0.6)] border border-white/10 flex-col gap-[4px] items-start justify-center xl:left-[53.5%] xl:top-[7.5%] xl:translate-x-0 xl:translate-y-0 xl:right-auto 2xl:left-[54%] 2xl:top-[8%] 2xl:translate-x-0 2xl:translate-y-0 3xl:right-auto 3xl:left-[calc(50%+199px)] 3xl:top-[calc(50%-288px)] 3xl:-translate-x-1/2 3xl:-translate-y-1/2 overflow-clip p-3.5 2xl:px-[18px] 2xl:py-[14px] 3xl:px-[20px] 3xl:py-[16px] rounded-[20px] z-20 pointer-events-auto shadow-xl xl:w-[220px] 2xl:w-[230px] 3xl:w-[248px]" 
          data-node-id="1:929"
        >
          <div className="relative shrink-0 size-5 2xl:size-[22px] 3xl:size-[24px]" data-node-id="1:930">
            <img alt="Target" className="size-full" src={imgTarget} />
          </div>
          <p className="font-bold text-[17px] 2xl:text-[18px] 3xl:text-[18px] text-white leading-normal whitespace-nowrap" data-node-id="1:931">
            99.4%
          </p>
          <p className="font-normal opacity-60 text-[11px] 2xl:text-[12px] 3xl:text-[12px] text-white leading-normal whitespace-nowrap" data-node-id="1:932">
            IRS Accuracy &amp; Compliance Rate
          </p>
        </div>

        {/* Floating Stat Card 2 (Full Audit Shield) */}
        <div 
          className="hidden xl:flex absolute backdrop-blur-[10px] bg-[rgba(15,39,61,0.6)] border border-white/10 flex-col gap-[4px] items-start justify-center xl:right-[60px] xl:top-[56%] xl:left-auto xl:translate-x-0 xl:translate-y-0 2xl:right-[80px] 2xl:top-[56%] 2xl:left-auto 2xl:translate-x-0 2xl:translate-y-0 3xl:right-auto 3xl:left-[calc(50%+693px)] 3xl:top-[calc(50%+202px)] 3xl:-translate-x-1/2 3xl:-translate-y-1/2 overflow-clip p-3.5 2xl:px-[18px] 2xl:py-[14px] 3xl:px-[20px] 3xl:py-[16px] rounded-[20px] z-20 pointer-events-auto shadow-xl xl:w-[200px] 2xl:w-[208px] 3xl:w-[214px]" 
          data-node-id="1:933"
        >
          <div className="relative shrink-0 size-5 2xl:size-[22px] 3xl:size-[24px]" data-node-id="1:934">
            <img alt="Shield" className="size-full" src={imgShieldCheck} />
          </div>
          <p className="font-bold text-[17px] 2xl:text-[18px] 3xl:text-[18px] text-white leading-normal whitespace-nowrap" data-node-id="1:935">
            100%
          </p>
          <p className="font-normal opacity-60 text-[11px] 2xl:text-[12px] 3xl:text-[12px] text-white leading-normal whitespace-nowrap" data-node-id="1:936">
            Full Audit Shield Protection
          </p>
        </div>
      </div>

      {/* Main Content Column (Node 1:938) */}
      <div className="relative z-10 max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] pt-12 pb-16 sm:pt-16 sm:pb-20 xl:pt-[90px] xl:pb-[118px] 2xl:pt-[100px] 2xl:pb-[130px] 3xl:pt-[120px] 3xl:pb-[20px]">
        <div className="max-w-[713px] flex flex-col gap-8 sm:gap-12 xl:gap-[36px] 2xl:gap-[50px] 3xl:gap-[80px] items-start" data-node-id="1:938">
          
          {/* Text and Actions (Node 1:939) */}
          <div className="flex flex-col gap-6 sm:gap-[30px] xl:gap-[24px] 2xl:gap-[26px] 3xl:gap-[30px] items-start w-full" data-node-id="1:939">
            
            {/* Title and Subtitle (Node 1:940) */}
            <div className="flex flex-col gap-4 sm:gap-[20px] xl:gap-[16px] 2xl:gap-[18px] 3xl:gap-[20px] items-start w-full" data-node-id="1:940">
              <div className="flex flex-col font-extrabold text-[29px] sm:text-[47px] xl:text-[45px] 2xl:text-[53px] 3xl:text-[62px] tracking-tight leading-[1.1] xl:leading-[52px] 2xl:leading-[60px] 3xl:leading-[70px] w-full" data-node-id="1:941">
                <span className="text-white" data-node-id="1:942">
                  Tax Experts At Your Service.
                </span>
                <span className="bg-clip-text bg-gradient-to-r from-[#16c5ff] to-[#0087db] text-transparent" data-node-id="1:943">
                  Your Year-Round Financial Partner.
                </span>
              </div>
              <p className="font-semibold text-[15px] sm:text-[17px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[18px] text-white leading-relaxed xl:leading-[24px] 2xl:leading-[27px] 3xl:leading-normal max-w-[622px]" data-node-id="1:944">
                From personal tax returns to small business bookkeeping, payroll, and IRS audit defense — TAXMAX gives you close, personal attention backed by decades of experience so you never overpay or stress over taxes.
              </p>
            </div>

            {/* Action Buttons (Node 1:945) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 xl:gap-3.5 2xl:gap-4 3xl:gap-[20px] pt-1 xl:pt-2" data-node-id="1:945">
              <a 
                href="#contact"
                className="bg-[#0094c5] border border-white/10 flex gap-2 2xl:gap-2.5 3xl:gap-[10px] items-center justify-center overflow-clip px-5 sm:px-6 xl:px-[18px] 2xl:px-[20px] 3xl:px-[24px] py-3 sm:py-3.5 xl:py-[12px] 2xl:py-[14px] 3xl:py-[16px] rounded-[100px] hover:bg-[#0082ad] transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer text-center"
                data-node-id="1:946"
              >
                <span className="font-extrabold text-[13px] sm:text-[15px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[18px] text-white whitespace-nowrap leading-normal" data-node-id="1:947">
                  Upload Your Documents
                </span>
                <div className="size-4 sm:size-5 2xl:size-[22px] 3xl:size-[24px] shrink-0" data-node-id="1:948">
                  <img alt="" className="size-full" src={imgArrowRight} />
                </div>
              </a>

              <a 
                href="#process"
                className="backdrop-blur-[10px] bg-white/10 border border-white/10 flex gap-2 2xl:gap-2.5 3xl:gap-[10px] items-center justify-center overflow-clip px-5 sm:px-6 xl:px-[18px] 2xl:px-[20px] 3xl:px-[24px] py-3 sm:py-3.5 xl:py-[12px] 2xl:py-[14px] 3xl:py-[16px] rounded-[100px] hover:bg-white/20 transition-all cursor-pointer text-center"
                data-node-id="1:949"
              >
                <span className="font-extrabold text-[13px] sm:text-[15px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[18px] text-white whitespace-nowrap leading-normal" data-node-id="1:950">
                  See How It Works
                </span>
                <div className="size-4 sm:size-5 2xl:size-[22px] 3xl:size-[24px] shrink-0" data-node-id="1:951">
                  <img alt="" className="size-full" src={imgArrowUpRight} />
                </div>
              </a>
            </div>
          </div>

          {/* Social Proof Divider and Metrics (Node 1:952) */}
          <div className="flex flex-col gap-5 sm:gap-[36px] xl:gap-[24px] 2xl:gap-[32px] 3xl:gap-[46px] items-start w-full" data-node-id="1:952">
            <div className="h-0 relative w-full" data-node-id="1:953">
              <div className="absolute inset-[-0.5px_0]">
                <img alt="" className="block max-w-none size-full" src={imgVector4} />
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-[14px] items-center w-full" data-node-id="1:954">
              <div className="flex items-center shrink-0" data-node-id="1:955">
                <div className="border-2 border-[#12253f] mr-[-7px] rounded-full shrink-0 size-9 2xl:size-[42px] 3xl:size-[46px] overflow-hidden" data-node-id="1:956">
                  <img alt="" className="size-full object-cover rounded-full" src={imgAvatar1} />
                </div>
                <div className="border-2 border-[#12253f] mr-[-7px] rounded-full shrink-0 size-9 2xl:size-[42px] 3xl:size-[46px] overflow-hidden" data-node-id="1:957">
                  <img alt="" className="size-full object-cover rounded-full" src={imgAvatar2} />
                </div>
                <div className="border-2 border-[#12253f] rounded-full shrink-0 size-9 2xl:size-[42px] 3xl:size-[46px] overflow-hidden" data-node-id="1:958">
                  <img alt="" className="size-full object-cover rounded-full" src={imgAvatar3} />
                </div>
              </div>

              <div className="flex-1 min-w-[200px]" data-node-id="1:959">
                <p className="text-[13px] 2xl:text-[14px] 3xl:text-[14px] text-white leading-snug">
                  <strong className="font-bold">Over $18M Saved in Deductions </strong>
                  <span className="font-normal text-[#cfcfcf]">for small businesses, self-employed contractors, and families.</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile/Tablet Fallback for Floating Stat Cards */}
        <div className="xl:hidden mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="backdrop-blur-[10px] bg-[rgba(15,39,61,0.6)] border border-white/10 flex flex-col gap-[4px] items-start p-4 rounded-[20px] shadow-lg">
            <img alt="Target" className="size-6" src={imgTarget} />
            <p className="font-bold text-[19px] text-white">99.4%</p>
            <p className="font-normal opacity-60 text-[13px] text-white">IRS Accuracy &amp; Compliance Rate</p>
          </div>
          <div className="backdrop-blur-[10px] bg-[rgba(15,39,61,0.6)] border border-white/10 flex flex-col gap-[4px] items-start p-4 rounded-[20px] shadow-lg">
            <img alt="Shield" className="size-6" src={imgShieldCheck} />
            <p className="font-bold text-[19px] text-white">100%</p>
            <p className="font-normal opacity-60 text-[13px] text-white">Full Audit Shield Protection</p>
          </div>
        </div>
      </div>
    </section>
  );
}
