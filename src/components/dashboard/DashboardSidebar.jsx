const imgLogo = "/figma/auth/logo.svg";
const imgBell = "/figma/dashboard/bell.svg";

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '/figma/dashboard/nav-home.svg', activeIcon: '/figma/dashboard/nav-home-active.svg' },
  { id: 'chat', label: 'Chat', icon: '/figma/dashboard/nav-chat.svg', activeIcon: '/figma/dashboard/nav-chat-active.svg' },
  { id: 'profile', label: 'Profile', icon: '/figma/dashboard/nav-profile.svg', activeIcon: '/figma/dashboard/nav-profile-active.svg' },
];

const Dot = ({ label }) => (
  <span aria-label={label} className="absolute -top-[2px] -right-[2px] bg-[#ea0101] rounded-full size-[8px] ring-2 ring-white" />
);

// Nav Bar (Node 71:2245). Collapses to a top bar below the lg breakpoint.
// `unreadMessages` / `hasUnreadNotifications` show a dot on Chat and the bell.
export default function DashboardSidebar({ activeTab, onSelectTab, onBackToHome, onToggleNotifications, unreadMessages = 0, hasUnreadNotifications = false }) {
  return (
    <div className="relative z-20 flex flex-col items-stretch shrink-0 p-[16px] lg:p-[20px] lg:sticky lg:top-0 lg:h-[var(--vh)]" data-node-id="71:2245">
      <div className="bg-white flex lg:flex-[1_0_0] lg:flex-col gap-[12px] lg:gap-[30px] items-center lg:items-start min-h-px px-[16px] lg:px-[20px] py-[12px] lg:py-[40px] rounded-[20px] shadow-[0px_0px_30px_rgba(0,101,131,0.1)] lg:w-[300px]" data-node-id="71:2246">
        <button type="button" onClick={onBackToHome} className="hidden sm:block h-[38.107px] relative shrink-0 w-[159px] cursor-pointer" aria-label="TAXMAX home" data-node-id="71:2247">
          <img alt="TAXMAX" className="absolute block inset-0 max-w-none size-full" src={imgLogo} />
        </button>

        <nav className="flex lg:flex-col gap-[4px] lg:gap-[10px] items-start flex-1 lg:flex-none lg:w-full sm:justify-end" data-node-id="71:2256">
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex gap-[10px] items-start px-[12px] sm:px-[16px] py-[14px] rounded-[16px] shrink-0 lg:w-full cursor-pointer transition-[opacity,background-color] ${active ? 'bg-[rgba(0,148,197,0.1)]' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className="relative shrink-0 size-[18px]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={active ? item.activeIcon : item.icon} />
                  {item.id === 'chat' && unreadMessages > 0 && <Dot label={`${unreadMessages} unread messages`} />}
                </div>
                <p
                  className={`font-['DM_Sans',sans-serif] leading-[normal] text-[14px] text-left whitespace-nowrap ${active ? 'font-semibold text-[#0094c5]' : 'hidden sm:block font-normal text-[#111]'}`}
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  {item.label}
                </p>
              </button>
            );
          })}
        </nav>

        <button type="button" onClick={onToggleNotifications} className="lg:hidden bg-[#f5f5f5] flex items-center justify-center rounded-[100px] shrink-0 size-[40px] cursor-pointer" aria-label="Notifications">
          <div className="relative shrink-0 size-[24px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBell} />
            {hasUnreadNotifications && <Dot label="Unread notifications" />}
          </div>
        </button>
      </div>
    </div>
  );
}
