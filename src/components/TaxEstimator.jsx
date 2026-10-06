import { useState } from 'react';

const imgGroup11 = "/figma/28a4b37b78c7c82e8ce937200306421c4ce46df6.svg";
const imgVector4 = "/figma/7a5550aeb5b0c01513b78a5754a88bd6e7ca35b8.svg";
const imgArrowRight = "/figma/0836a6f58bee20c26ca9f18c84ce1cb5e104a898.svg";

const entities = [
  {
    id: 'individual',
    title: 'Individual / Freelancer',
    subtitle: '1040 / Schedule C',
    nodeId: '1:1622',
    deductionFactor: 0.35,
    savingsFactor: 0.15,
    strategy: 'Schedule C Business Expense Maximization & Solo 401(k) Shelter'
  },
  {
    id: 's-corp',
    title: 'LLC / S-Corporation',
    subtitle: '1120-S Election',
    nodeId: '1:1625',
    deductionFactor: 0.45,
    savingsFactor: 0.22,
    strategy: 'Corporate 1120 / 1065 Strategic Tax Plan & Monthly Bookkeeping'
  },
  {
    id: 'corporation',
    title: 'Corporation / Partner',
    subtitle: '1120 / 1065',
    nodeId: '1:1628',
    deductionFactor: 0.50,
    savingsFactor: 0.25,
    strategy: 'Corporate 1120 / 1065 Strategic Tax Plan & Monthly Bookkeeping'
  }
];

export default function TaxEstimator() {
  const [selectedEntity, setSelectedEntity] = useState(entities[1]);
  const [revenue, setRevenue] = useState(175000);
  const [expenses, setExpenses] = useState(55000);

  // Exact calculations preserving Figma defaults at revenue=175k, expenses=55k:
  // Eligible Deductions: $72,250
  // Estimated Savings: $22,500
  const netIncome = Math.max(0, revenue - expenses);
  const eligibleDeductions = Math.round(expenses + (netIncome * (selectedEntity.deductionFactor || 0.4)));
  const estimatedSavings = Math.round(netIncome * (selectedEntity.savingsFactor || 0.22));

  const formatCurrency = (val) => {
    return '$' + val.toLocaleString('en-US');
  };

  return (
    <section id="estimator" className="w-full bg-[#f5f5f5] py-16 sm:py-20 xl:py-[80px]" data-node-id="1:1613">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-[80px] 2xl:px-[100px] 3xl:px-[160px] flex flex-col gap-10 xl:gap-[40px] items-center">
        
        {/* Section Header (Node 1:1614) */}
        <div className="flex flex-col gap-2 2xl:gap-[8px] 3xl:gap-[10px] items-center text-center max-w-[800px]" data-node-id="1:1614">
          <h2 className="font-bold text-[23px] sm:text-[29px] xl:text-[33px] 2xl:text-[39px] 3xl:text-[46px] tracking-tight leading-tight xl:leading-[44px] 2xl:leading-[50px] 3xl:leading-[60px] text-black w-full" data-node-id="1:1615">
            Estimate Your Potential Tax Strategy &amp; Savings
          </h2>
          <p className="font-medium text-[13px] sm:text-[15px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[18px] leading-relaxed xl:leading-[24px] 2xl:leading-[27px] 3xl:leading-[32px] text-black w-full" data-node-id="1:1616">
            Select your filing entity and revenue to see how much proactive tax planning and certified bookkeeping can save your business.
          </p>
        </div>

        {/* Interactive Estimator Card (Node 1:1617) */}
        <div 
          className="bg-white rounded-[30px] p-5 sm:p-8 xl:p-[32px] 2xl:p-[36px] 3xl:p-[40px] shadow-[0px_0px_60px_0px_rgba(0,72,131,0.1)] w-full max-w-[1276px] flex flex-col lg:flex-row gap-6 xl:gap-8 2xl:gap-10 3xl:gap-[60px] items-stretch overflow-hidden" 
          data-node-id="1:1617"
        >
          {/* Controls Column (Node 1:1618) */}
          <div className="flex-1 flex flex-col justify-between gap-6 xl:gap-6 2xl:gap-7 3xl:gap-8 h-full min-w-0" data-node-id="1:1618">
            
            {/* Step 1: Entity Selection (Node 1:1619) */}
            <div className="flex flex-col gap-2 2xl:gap-[8px] 3xl:gap-[10px] items-start w-full" data-node-id="1:1619">
              <label className="font-bold text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] leading-normal text-black w-full" data-node-id="1:1620">
                1. Select Filing Entity / Status
              </label>
              
              <div 
                className="bg-[#e8e8e8] p-[4px] rounded-[20px] flex flex-col sm:flex-row items-center w-full gap-1 sm:gap-0"
                data-node-id="1:1621"
              >
                {entities.map((entity) => {
                  const isSelected = selectedEntity.id === entity.id;
                  return (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => setSelectedEntity(entity)}
                      className={`flex-1 w-full sm:w-auto px-3 xl:px-4 2xl:px-[16px] 3xl:px-[20px] py-2.5 xl:py-2.5 2xl:py-[10px] 3xl:py-[12px] rounded-[16px] flex flex-col gap-1 2xl:gap-[6px] 3xl:gap-[8px] items-center justify-end min-w-[60px] cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)]'
                          : 'hover:text-[#0094c5]'
                      }`}
                      data-node-id={entity.nodeId}
                    >
                      <span className={`text-[11px] sm:text-[13px] xl:text-[12px] 2xl:text-[13.5px] 3xl:text-[14px] leading-snug whitespace-nowrap text-[#111111] ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                        {entity.title}
                      </span>
                      <span className="text-[10px] sm:text-[11px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[12px] leading-tight opacity-80 text-[#111111] whitespace-nowrap">
                        {entity.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Revenue Slider (Node 1:1631) */}
            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[20px] items-start w-full" data-node-id="1:1631">
              <div className="flex items-center justify-between leading-normal text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] w-full" data-node-id="1:1632">
                <span className="font-bold text-black" data-node-id="1:1633">
                  2. Estimated Annual Gross Income / Revenue
                </span>
                <span className="font-extrabold text-[13px] sm:text-[15px] xl:text-[15px] 2xl:text-[16px] 3xl:text-[16px] text-[#0094c5] text-right" data-node-id="1:1634">
                  {formatCurrency(revenue)}
                </span>
              </div>

              {/* Slider Track with Custom styling and dots (Node 1:1635) */}
              <div className="relative w-full py-1">
                <input 
                  type="range" 
                  min="30000" 
                  max="1000000" 
                  step="5000"
                  value={revenue} 
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full relative z-10"
                />
              </div>

              <div className="flex items-center justify-between font-normal text-[11px] xl:text-[11px] 2xl:text-[12px] 3xl:text-[12px] text-[#111111] leading-none w-full" data-node-id="1:1643">
                <span className="opacity-80" data-node-id="1:1644">$30,000</span>
                <span className="opacity-80" data-node-id="1:1645">$1,000,000+</span>
              </div>
            </div>

            {/* Step 3: Expenses Slider (Node 1:1646) */}
            <div className="flex flex-col gap-3 2xl:gap-3.5 3xl:gap-[20px] items-start w-full" data-node-id="1:1646">
              <div className="flex items-center justify-between leading-normal text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] w-full" data-node-id="1:1647">
                <span className="font-bold text-black" data-node-id="1:1648">
                  3. Estimated Annual Operating Expenses
                </span>
                <span className="font-extrabold text-[13px] sm:text-[15px] xl:text-[15px] 2xl:text-[16px] 3xl:text-[16px] text-[#0094c5] text-right" data-node-id="1:1649">
                  {formatCurrency(expenses)}
                </span>
              </div>

              {/* Slider Track (Node 1:1650) */}
              <div className="relative w-full py-1">
                <input 
                  type="range" 
                  min="5000" 
                  max="500000" 
                  step="2500"
                  value={expenses} 
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  className="w-full relative z-10"
                />
              </div>

              <div className="flex items-center justify-between font-normal text-[11px] xl:text-[11px] 2xl:text-[12px] 3xl:text-[12px] text-[#111111] leading-none w-full" data-node-id="1:1658">
                <span className="opacity-80" data-node-id="1:1659">$5,000</span>
                <span className="opacity-80" data-node-id="1:1660">$500,000+</span>
              </div>
            </div>

          </div>

          {/* Results Summary Card (Node 1:1661) */}
          <div 
            className="bg-gradient-to-b from-[#0d2445] to-[#05162e] w-full lg:w-[380px] xl:w-[400px] 2xl:w-[420px] 3xl:w-[480px] min-h-[380px] 2xl:min-h-[400px] 3xl:min-h-[420px] rounded-[20px] p-5 sm:p-6 2xl:p-[26px] 3xl:p-[30px] flex flex-col justify-between overflow-hidden relative shrink-0 text-white shadow-2xl"
            data-node-id="1:1661"
          >
            {/* Ambient Graphic (Node 1:1662) */}
            <div className="absolute h-[562px] left-[13px] top-[-363px] w-[774px] pointer-events-none opacity-40" data-node-id="1:1662">
              <img alt="" className="block size-full max-w-none" src={imgGroup11} />
            </div>

            {/* Eligible Deductions (Node 1:1665) */}
            <div className="relative z-10 flex flex-col gap-1 2xl:gap-[4px] items-start w-full" data-node-id="1:1665">
              <span className="font-normal text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] opacity-80 leading-normal" data-node-id="1:1666">
                Estimated Eligible Deductions
              </span>
              <p className="font-bold text-[23px] sm:text-[29px] xl:text-[29px] 2xl:text-[32px] 3xl:text-[34px] text-white leading-normal tracking-tight" data-node-id="1:1667">
                {formatCurrency(eligibleDeductions)}
              </p>
            </div>

            {/* Divider (Node 1:1668) */}
            <div className="relative z-10 w-full h-0 my-1" data-node-id="1:1668">
              <img alt="" className="block max-w-none w-full" src={imgVector4} />
            </div>

            {/* Estimated Annual Tax Savings (Node 1:1669) */}
            <div className="relative z-10 flex flex-col gap-1 2xl:gap-[4px] items-start w-full" data-node-id="1:1669">
              <span className="font-normal text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] opacity-80 leading-normal" data-node-id="1:1670">
                Estimated Annual Tax Savings
              </span>
              <p className="font-bold text-[23px] sm:text-[29px] xl:text-[29px] 2xl:text-[32px] 3xl:text-[34px] text-[#4eff6f] leading-normal tracking-tight" data-node-id="1:1671">
                {formatCurrency(estimatedSavings)}
              </p>
            </div>

            {/* Recommended Strategy (Node 1:1672) */}
            <div 
              className="relative z-10 backdrop-blur-[10px] bg-white/10 border border-white/10 p-2.5 2xl:p-[10px] 3xl:p-[12px] rounded-[10px] flex flex-col gap-1 2xl:gap-[4px] items-center justify-center leading-normal w-full" 
              data-node-id="1:1672"
            >
              <span className="font-bold text-[9px] 2xl:text-[10px] 3xl:text-[10px] text-[#1472ff] uppercase w-full" data-node-id="1:1673">
                RECOMMENDED STRATEGY
              </span>
              <p className="font-normal text-[11px] xl:text-[11px] 2xl:text-[12px] 3xl:text-[12px] text-white w-full" data-node-id="1:1674">
                {selectedEntity.strategy}
              </p>
            </div>

            {/* CTA Button (Node 1:1675) */}
            <a 
              href="#contact"
              className="relative z-10 bg-[#0094c5] border border-white/10 px-4 xl:px-5 2xl:px-[20px] 3xl:px-[24px] py-3 xl:py-3.5 2xl:py-[14px] 3xl:py-[16px] rounded-[100px] flex gap-2 2xl:gap-2.5 3xl:gap-[10px] items-center justify-center w-full hover:bg-[#0082ad] transition-all shadow-md cursor-pointer text-center"
              data-node-id="1:1675"
            >
              <span className="font-extrabold text-[11px] sm:text-[13px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[14px] text-white capitalize leading-normal whitespace-nowrap" data-node-id="1:1676">
                Upload Documents to Claim Savings
              </span>
              <div className="relative shrink-0 size-4 sm:size-5 2xl:size-[22px] 3xl:size-[24px]" data-node-id="1:1677">
                <img alt="" className="size-full" src={imgArrowRight} />
              </div>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}
