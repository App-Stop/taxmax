import { useState, useEffect } from 'react';

const imgGlow = "/figma/auth/login-glow.svg";

// Glow offsets are the Figma x/y of the ellipse inside the 710×1024 panel.
const SLIDES = [
  {
    image: "/figma/auth/login-slide-files.png",
    frameClass: "w-[360px]",
    imageClass: "inset-0 size-full object-cover",
    glow: { x: 403, y: 0 },
    title: "Ready to change the way you file?",
    subtitle: "With TAXMAX, don’t worry about your taxing.",
    textClass: "w-full",
    subtitleClass: "w-full",
  },
  {
    image: "/figma/auth/login-slide-scan.png",
    frameClass: "w-[381px]",
    imageClass: "h-[100.05%] left-[0.07%] top-[-0.03%] w-[99.93%]",
    glow: { x: -219, y: 303 },
    title: "Snap any form, we do the rest.",
    subtitle: "Don’t worry about manually filling in the details.",
    textClass: "w-[370px]",
    subtitleClass: "w-full",
  },
  {
    image: "/figma/auth/login-slide-secure.png",
    frameClass: "w-[360px]",
    imageClass: "inset-0 size-full object-cover",
    glow: { x: 185, y: 145 },
    title: "You data, protected - period.",
    subtitle: "All information stays private and secure.",
    textClass: "w-[370px]",
    subtitleClass: "w-[311px]",
  },
];

const AUTOPLAY_MS = 5000;

export default function LoginShowcase() {
  const [active, setActive] = useState(0);
  const slide = SLIDES[active];

  useEffect(() => {
    const id = setTimeout(() => setActive((active + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div className="relative bg-white flex flex-col gap-[160px] h-full items-center justify-center overflow-clip px-[115px] py-[60px] w-[49.306%] shrink-0" data-node-id="71:1596">
      {/* Glow (Node 71:1597) */}
      <div
        className="absolute size-[384px] pointer-events-none transition-[left,top] duration-700 ease-in-out"
        style={{
          left: `calc(50% - 355px + ${slide.glow.x}px)`,
          top: `calc(50% - 512px + ${slide.glow.y}px)`,
        }}
        data-node-id="71:1597"
      >
        <div className="absolute inset-[-78.13%]">
          <img alt="" className="block max-w-none size-full" src={imgGlow} />
        </div>
      </div>

      {/* Illustration (Node 71:1598) */}
      <div key={slide.image} className={`h-[357px] relative shrink-0 animate-auth-fade-in ${slide.frameClass}`} data-node-id="71:1598">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className={`absolute max-w-none ${slide.imageClass}`} src={slide.image} />
        </div>
      </div>

      <div className="flex flex-col gap-[20px] items-start relative shrink-0 w-[480px] max-w-full" data-node-id="71:1599">
        {/* Progress (Node 71:1600) */}
        <div className="flex gap-[10px] items-center w-full" data-node-id="71:1600">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === active}
              className={`relative bg-[#111] flex-[1_0_0] h-[4px] min-w-px rounded-[10px] cursor-pointer transition-opacity duration-300 after:absolute after:inset-x-0 after:-inset-y-[10px] ${i <= active ? '' : 'opacity-20'}`}
            />
          ))}
        </div>

        <div key={slide.title} className={`flex flex-col gap-[10px] items-start justify-center animate-auth-fade-in ${slide.textClass}`} data-node-id="71:1604">
          <p className="font-extrabold leading-[36px] text-[32px] text-[#111] tracking-[-0.32px] w-full" data-node-id="71:1605">
            {slide.title}
          </p>
          <p className={`font-normal leading-[normal] text-[16px] text-[#444] ${slide.subtitleClass}`} data-node-id="71:1606">
            {slide.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
