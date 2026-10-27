import { Icon } from './ui';
import { ADMIN_NAV } from './adminData';

const A = '/figma/admin';

// Side nav (Node 87:1626). Collapses to an icon rail on desktop and becomes a drawer below lg.
// `badges`: nav id -> count shown beside the item (e.g. unread messages).
export default function AdminSidebar({ active, badges = {}, onSelect, collapsed, onToggleCollapsed, mobileOpen, onCloseMobile, onBackToHome }) {
  return (
    <>
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={onCloseMobile} aria-hidden />}
      <aside
        className={`fixed lg:sticky lg:self-start z-50 lg:z-auto top-[20px] left-[20px] lg:left-auto shrink-0 h-[calc(var(--vh)-40px)] transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+40px)]'}`}
        data-node-id="87:1626"
      >
        <div className={`bg-white flex flex-col gap-[20px] h-full items-start overflow-clip pb-[10px] pt-[16px] px-[10px] rounded-[20px] transition-[width] ${collapsed ? 'lg:w-[64px] w-[264px]' : 'w-[264px]'}`}>
          <div className={`flex items-center justify-between p-[10px] shrink-0 w-full ${collapsed ? 'lg:justify-center lg:px-[12px]' : ''}`}>
            <button
              type="button"
              onClick={onBackToHome}
              aria-label="TAXMAX home"
              className={`h-[38.107px] relative shrink-0 w-[159px] cursor-pointer ${collapsed ? 'lg:hidden' : ''}`}
              data-node-id="87:1628"
            >
              <img alt="TAXMAX" className="absolute block inset-0 max-w-none size-full" src={`${A}/logo.svg`} />
            </button>
            <button
              type="button"
              onClick={() => (mobileOpen ? onCloseMobile() : onToggleCollapsed())}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="relative shrink-0 size-[20px] cursor-pointer opacity-80 hover:opacity-100"
              data-node-id="87:1637"
            >
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/sidebar.svg`} />
            </button>
          </div>

          <nav className="flex flex-col gap-[6px] items-start shrink-0 w-full" data-node-id="87:1638">
            {ADMIN_NAV.map((item) => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`flex gap-[10px] items-center p-[10px] relative rounded-[10px] shrink-0 w-full cursor-pointer transition-colors ${isActive ? 'bg-[rgba(0,148,197,0.1)]' : 'hover:bg-[#f5f5f5]'}`}
                >
                  <Icon src={isActive && item.activeIcon ? item.activeIcon : item.icon} />
                  <span
                    className={`leading-[normal] text-[14px] text-left whitespace-nowrap ${isActive ? 'font-semibold text-[#0094c5]' : 'font-normal text-[#444] tracking-[0.14px]'} ${collapsed ? 'lg:hidden' : ''}`}
                  >
                    {item.label}
                  </span>
                  {badges[item.id] > 0 && (
                    <span
                      aria-label={`${badges[item.id]} unread`}
                      className={`bg-[#0094c5] text-white text-[10px] font-bold rounded-[100px] min-w-[18px] h-[18px] px-[5px] flex items-center justify-center ml-auto ${collapsed ? 'lg:absolute lg:top-[4px] lg:right-[4px] lg:min-w-[14px] lg:h-[14px] lg:px-[3px]' : ''}`}
                    >
                      {badges[item.id] > 99 ? '99+' : badges[item.id]}
                    </span>
                  )}
                  {isActive && <span className="-translate-y-1/2 absolute bg-[#0094c5] h-[16px] left-[-2px] rounded-[10px] top-1/2 w-[4px]" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
