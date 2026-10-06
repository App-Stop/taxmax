import { useState } from 'react';

const imgPhoneCall = "/figma/f1ffc58cc3a6750da83f8f04be19a68da8ce9707.svg";
const imgVector5 = "/figma/03ff9f1bb7f9aa76c70dfdaadb7fb2c054f83e38.svg";
const imgEnvelope = "/figma/4efe8c493a319009146109ea4b5fb586796648df.svg";
const imgMapPin = "/figma/edd92a59924392934d80eef6c85831327df70411.svg";
const imgCaretDown = "/figma/aa22a78781eab81e9ee437a8a8fa362e03191caa.svg";
const imgArrowRight = "/figma/0836a6f58bee20c26ca9f18c84ce1cb5e104a898.svg";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    filingType: 'Personal (1040)',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      alert('Please fill in required fields: Full Name and Email Address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <section 
      id="contact"
      className="w-full bg-gradient-to-r from-[#0d1d35] via-1/2 via-[#132d54] to-[#0d1d35] py-16 sm:py-24 xl:py-[120px]"
      data-node-id="1:1025"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px]">
        <div className="flex flex-col xl:flex-row gap-10 xl:gap-10 2xl:gap-12 3xl:gap-[100px] items-center">
          
          {/* Left Column (Node 1:1026) */}
          <div className="flex flex-col gap-6 sm:gap-8 xl:gap-[32px] 2xl:gap-[40px] 3xl:gap-[60px] items-start justify-center flex-1 min-w-0" data-node-id="1:1026">
            <div className="flex flex-col gap-2 2xl:gap-[8px] 3xl:gap-[10px] items-start text-white w-full" data-node-id="1:1027">
              <h2 className="font-bold text-2xl sm:text-3xl xl:text-[34px] 2xl:text-[40px] 3xl:text-[48px] tracking-tight leading-tight xl:leading-[44px] 2xl:leading-[50px] 3xl:leading-[60px] w-full" data-node-id="1:1028">
                Ready to File? Upload Your Documents.
              </h2>
              <p className="font-medium text-sm sm:text-base xl:text-[15px] 2xl:text-[17px] 3xl:text-[20px] leading-relaxed xl:leading-[24px] 2xl:leading-[27px] 3xl:leading-[32px] w-full" data-node-id="1:1029">
                Upload your W-2s, 1099s, and tax documents securely. We automatically detect, organize, and start preparing your return — no appointment needed.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:gap-6 2xl:gap-6 3xl:gap-[30px] items-start justify-center w-full" data-node-id="1:1030">
              
              {/* Phone item (Node 1:1031) */}
              <div className="flex flex-col gap-1 2xl:gap-[6px] items-start justify-center" data-node-id="1:1031">
                <div className="flex gap-1.5 2xl:gap-[6px] items-center opacity-80" data-node-id="1:1032">
                  <div className="relative shrink-0 size-4 2xl:size-[18px] 3xl:size-[20px]" data-node-id="1:1033">
                    <img alt="" className="size-full" src={imgPhoneCall} />
                  </div>
                  <span className="font-medium text-xs xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] text-white whitespace-nowrap leading-normal" data-node-id="1:1034">
                    QUESTIONS?
                  </span>
                </div>
                <a 
                  href="tel:6122053354" 
                  className="font-semibold text-base sm:text-lg xl:text-[17px] 2xl:text-[18px] 3xl:text-[20px] text-white leading-normal 2xl:leading-[28px] 3xl:leading-[32px] hover:text-[#0094c5] transition-colors"
                  data-node-id="1:1035"
                >
                  (612) 205-3354
                </a>
              </div>

              {/* Divider (Node 1:1036) */}
              <div className="w-full h-0 relative" data-node-id="1:1036">
                <img alt="" className="block max-w-none w-full" src={imgVector5} />
              </div>

              {/* Email item (Node 1:1037) */}
              <div className="flex flex-col gap-1 2xl:gap-[6px] items-start justify-center" data-node-id="1:1037">
                <div className="flex gap-1.5 2xl:gap-[6px] items-center opacity-80" data-node-id="1:1038">
                  <div className="relative shrink-0 size-4 2xl:size-[18px] 3xl:size-[20px]" data-node-id="1:1039">
                    <img alt="" className="size-full" src={imgEnvelope} />
                  </div>
                  <span className="font-medium text-xs xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] text-white whitespace-nowrap leading-normal" data-node-id="1:1040">
                    NEED HELP?
                  </span>
                </div>
                <a 
                  href="mailto:taxmax@comcast.net" 
                  className="font-semibold text-base sm:text-lg xl:text-[17px] 2xl:text-[18px] 3xl:text-[20px] text-white leading-normal 2xl:leading-[28px] 3xl:leading-[32px] hover:text-[#0094c5] transition-colors"
                  data-node-id="1:1041"
                >
                  taxmax@comcast.net
                </a>
              </div>

              {/* Divider (Node 1:1042) */}
              <div className="w-full h-0 relative" data-node-id="1:1042">
                <img alt="" className="block max-w-none w-full" src={imgVector5} />
              </div>

              {/* Location item (Node 1:1043) */}
              <div className="flex flex-col gap-1 2xl:gap-[6px] items-start justify-center" data-node-id="1:1043">
                <div className="flex gap-1.5 2xl:gap-[6px] items-center opacity-80" data-node-id="1:1044">
                  <div className="relative shrink-0 size-4 2xl:size-[18px] 3xl:size-[20px]" data-node-id="1:1045">
                    <img alt="" className="size-full" src={imgMapPin} />
                  </div>
                  <span className="font-medium text-xs xl:text-[12px] 2xl:text-[13px] 3xl:text-[14px] text-white whitespace-nowrap leading-normal" data-node-id="1:1046">
                    FILE FROM ANYWHERE
                  </span>
                </div>
                <p className="font-semibold text-base sm:text-lg xl:text-[17px] 2xl:text-[18px] 3xl:text-[20px] text-white leading-normal 2xl:leading-[28px] 3xl:leading-[32px]" data-node-id="1:1047">
                  Minneapolis, MN • Virtual Services Nationwide
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: Form (Node 1:1048) */}
          <div 
            className="bg-white p-5 sm:p-8 xl:p-[28px] 2xl:p-[32px] 3xl:p-[40px] rounded-[30px] shadow-[0px_0px_60px_0px_rgba(0,72,131,0.1)] w-full xl:w-[560px] 2xl:w-[620px] 3xl:w-[700px] shrink-0"
            data-node-id="1:1048"
          >
            {submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
                <div className="size-16 rounded-full bg-[#0094c5]/10 text-[#0094c5] flex items-center justify-center">
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black">
                  Documents Portal Initialized!
                </h3>
                <p className="text-base text-[#444444] max-w-[420px]">
                  Thank you, <strong>{formData.fullName}</strong>. A secure upload link has been prepared for <strong>{formData.email}</strong>. Our senior tax team will reach out promptly.
                </p>
                <button 
                  type="button" 
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm font-semibold text-[#0094c5] hover:underline cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 2xl:gap-6 3xl:gap-[40px] w-full">
                
                {/* Row 1: Name and Email (Node 1:1049) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-[16px] 3xl:gap-[20px] w-full" data-node-id="1:1049">
                  <div className="flex flex-col gap-1.5 2xl:gap-[10px] items-start w-full" data-node-id="1:1050">
                    <label className="font-semibold text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-black leading-snug 2xl:leading-[22px] 3xl:leading-[24px] w-full" data-node-id="1:1051">
                      Full Name *
                    </label>
                    <div className="bg-white border border-[#dcdcdc] rounded-[10px] p-3 2xl:p-[12px] 3xl:p-[14px] w-full h-[44px] 2xl:h-[46px] 3xl:h-[50px] flex items-center" data-node-id="1:1052">
                      <input 
                        type="text" 
                        required
                        placeholder="Robert Anderson"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full font-medium text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-[#111111] placeholder:text-[#b6b6b6] outline-none"
                        data-node-id="1:1053"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 2xl:gap-[10px] items-start w-full" data-node-id="1:1054">
                    <label className="font-semibold text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-black leading-snug 2xl:leading-[22px] 3xl:leading-[24px] w-full" data-node-id="1:1055">
                      Email Address *
                    </label>
                    <div className="bg-white border border-[#dcdcdc] rounded-[10px] p-3 2xl:p-[12px] 3xl:p-[14px] w-full h-[44px] 2xl:h-[46px] 3xl:h-[50px] flex items-center" data-node-id="1:1056">
                      <input 
                        type="email" 
                        required
                        placeholder="robert@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full font-medium text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-[#111111] placeholder:text-[#b6b6b6] outline-none"
                        data-node-id="1:1057"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone and Filing Type (Node 1:1058) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-[16px] 3xl:gap-[20px] w-full" data-node-id="1:1058">
                  <div className="flex flex-col gap-1.5 2xl:gap-[10px] items-start w-full" data-node-id="1:1059">
                    <label className="font-semibold text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-black leading-snug 2xl:leading-[22px] 3xl:leading-[24px] w-full" data-node-id="1:1060">
                      Phone Number *
                    </label>
                    <div className="bg-white border border-[#dcdcdc] rounded-[10px] p-3 2xl:p-[12px] 3xl:p-[14px] w-full h-[44px] 2xl:h-[46px] 3xl:h-[50px] flex items-center" data-node-id="1:1061">
                      <input 
                        type="tel" 
                        placeholder="+1 123 213123"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full font-medium text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-[#111111] placeholder:text-[#b6b6b6] outline-none"
                        data-node-id="1:1062"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 2xl:gap-[10px] items-start w-full" data-node-id="1:1063">
                    <label className="font-semibold text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-black leading-snug 2xl:leading-[22px] 3xl:leading-[24px] w-full" data-node-id="1:1064">
                      Filing Type *
                    </label>
                    <div className="bg-white border border-[#dcdcdc] rounded-[10px] p-3 2xl:p-[12px] 3xl:p-[14px] w-full h-[44px] 2xl:h-[46px] 3xl:h-[50px] flex items-center justify-between relative cursor-pointer" data-node-id="1:1065">
                      <select 
                        value={formData.filingType}
                        onChange={(e) => setFormData({ ...formData, filingType: e.target.value })}
                        className="w-full font-medium text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-[#111111] bg-transparent outline-none appearance-none cursor-pointer pr-6"
                        data-node-id="1:1066"
                      >
                        <option value="Personal (1040)">Personal (1040)</option>
                        <option value="S-Corporation (1120-S)">S-Corporation (1120-S)</option>
                        <option value="Partnership (1065)">Partnership (1065)</option>
                        <option value="C-Corporation (1120)">C-Corporation (1120)</option>
                        <option value="Bookkeeping / Payroll">Bookkeeping / Payroll</option>
                      </select>
                      <div className="relative shrink-0 size-4 2xl:size-[18px] 3xl:size-[20px] pointer-events-none -ml-5" data-node-id="1:1067">
                        <img alt="" className="size-full" src={imgCaretDown} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Details (Node 1:1068) */}
                <div className="flex flex-col gap-1.5 2xl:gap-[10px] items-start w-full" data-node-id="1:1068">
                  <label className="font-semibold text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-black leading-snug 2xl:leading-[22px] 3xl:leading-[24px] w-full" data-node-id="1:1069">
                    Brief Financial or Tax Details
                  </label>
                  <div className="bg-white border border-[#dcdcdc] rounded-[10px] p-3 2xl:p-[12px] 3xl:p-[14px] w-full h-[100px] 2xl:h-[110px] 3xl:h-[120px]" data-node-id="1:1070">
                    <textarea 
                      placeholder="Tell us about your business, filing status, or specific questions.."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full h-full font-medium text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-[#111111] placeholder:text-[#b6b6b6] outline-none resize-none"
                      data-node-id="1:1071"
                    />
                  </div>
                </div>

                {/* Submit Button (Node 1:1072) */}
                <button
                  type="submit"
                  className="bg-[#0094c5] border border-white/10 px-5 2xl:px-[20px] 3xl:px-[24px] py-3.5 2xl:py-[14px] 3xl:py-[16px] rounded-[100px] flex gap-2 2xl:gap-2.5 3xl:gap-[10px] items-center justify-center w-full hover:bg-[#0082ad] transition-all shadow-md cursor-pointer"
                  data-node-id="1:1072"
                >
                  <span className="capitalize font-bold text-xs sm:text-sm xl:text-[14px] 2xl:text-[15px] 3xl:text-[16px] text-white leading-normal whitespace-nowrap" data-node-id="1:1073">
                    Start Secure Upload
                  </span>
                  <div className="relative shrink-0 size-4 sm:size-5 2xl:size-[22px] 3xl:size-[24px]" data-node-id="1:1074">
                    <img alt="" className="size-full" src={imgArrowRight} />
                  </div>
                </button>

              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
