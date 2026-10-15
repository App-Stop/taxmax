import { useState } from 'react';
import { Icon, Popover } from './ui';

const A = '/figma/admin';

// Top bar (Node 87:1820): profile pill, global search (dashboard only), bell and info buttons.
export default function AdminTopBar({ profile, showSearch, onSearch, onOpenMenu, onLogout, onBackToHome }) {
  const [query, setQuery] = useState('');

  return (
    <div className="flex items-center justify-between gap-[10px] w-full" data-node-id="87:1820">
      <div className="flex gap-[10px] items-center min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="lg:hidden bg-white flex items-center p-[16px] rounded-[60px] shrink-0 cursor-pointer"
        >
          <img alt="" className="block max-w-none" src={`${A}/sidebar.svg`} width="20" height="20" />
        </button>

        <Popover
          items={[
            { key: 'home', label: 'Back to website', onSelect: onBackToHome },
            { key: 'logout', label: 'Log out', danger: true, onSelect: onLogout },
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={open}
              className="bg-white flex gap-[10px] items-center pl-[4px] pr-[20px] py-[4px] rounded-[100px] shrink-0 cursor-pointer"
              data-node-id="87:1822"
            >
              <span className="relative rounded-[60px] shrink-0 size-[44px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[60px] size-full" src={profile.photo} />
              </span>
              <span className="flex flex-col items-start justify-center leading-[normal] whitespace-nowrap">
                <span className="font-semibold overflow-hidden text-[14px] text-[#111] text-ellipsis">{profile.name}</span>
                <span className="font-normal overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{profile.role}</span>
              </span>
            </button>
          )}
        />

        {showSearch && (
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(query.trim());
            }}
            className="hidden md:flex bg-white gap-[8px] items-center px-[16px] py-[14px] rounded-[60px] shrink-0 w-[360px]"
            data-node-id="87:1827"
          >
            <Icon src={`${A}/magnifying-glass.svg`} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients, submissions, documents..."
              aria-label="Search clients, submissions, documents"
              className="flex-1 min-w-0 bg-transparent outline-none font-normal leading-[normal] text-[14px] text-[#111] tracking-[0.14px] placeholder:text-[#444]"
            />
          </form>
        )}
      </div>

      <div className="flex gap-[10px] items-center shrink-0" data-node-id="87:1830">
        <button type="button" aria-label="Notifications" className="bg-white flex items-center p-[14px] rounded-[60px] shrink-0 cursor-pointer">
          <Icon src={`${A}/bell.svg`} />
        </button>
        <button type="button" aria-label="Help" className="bg-white flex items-center p-[14px] rounded-[60px] shrink-0 cursor-pointer">
          <Icon src={`${A}/info.svg`} />
        </button>
      </div>
    </div>
  );
}
