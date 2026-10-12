import { useState } from 'react';
import NotificationItem from './NotificationItem';

const FILTERS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'unread', label: 'Unread', match: (n) => n.unread },
  { id: 'documents', label: 'Documents', match: (n) => n.kind === 'document' },
  { id: 'messages', label: 'Messages', match: (n) => n.kind === 'message' },
];

const GROUPS = ['Today', 'Earlier'];

// Notifications Modal (Node 71:2462)
export default function NotificationsPanel({ notifications, onOpenNotification, onMarkAllRead, onClose }) {
  const [filterId, setFilterId] = useState('all');
  const visible = notifications.filter(FILTERS.find((f) => f.id === filterId).match);

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute z-40 top-[88px] lg:top-[80px] right-[16px] lg:right-[30px] w-[402px] max-w-[calc(100%-32px)] max-h-[calc(var(--vh)-100px)] overflow-y-auto backdrop-blur-[10px] bg-[rgba(255,255,255,0.8)] border border-solid border-white flex flex-col gap-[20px] items-center p-[16px] rounded-[20px] shadow-[0px_0px_120px_0px_rgba(0,0,0,0.25)] animate-auth-fade-in"
        role="dialog"
        aria-label="Notifications"
        data-node-id="71:2462"
      >
        <div className="flex flex-col gap-[14px] items-start shrink-0 w-full" data-node-id="71:2464">
          <div className="flex gap-[16px] h-[27px] items-center leading-[normal] shrink-0 w-full">
            <p className="flex-[1_0_0] font-bold min-w-px text-[20px] text-[#111]">Notifications</p>
            <button type="button" onClick={onMarkAllRead} className="font-semibold text-[12px] text-[#0094c5] whitespace-nowrap cursor-pointer hover:underline">
              Mark all read
            </button>
          </div>
          <div className="flex flex-wrap gap-[8px] items-start shrink-0 w-full" data-node-id="71:2468">
            {FILTERS.map((filter) => {
              const active = filter.id === filterId;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setFilterId(filter.id)}
                  aria-pressed={active}
                  className={`flex items-start overflow-clip px-[14px] py-[8px] rounded-[60px] shrink-0 cursor-pointer transition-colors font-semibold leading-[normal] text-[12px] whitespace-nowrap ${active ? 'bg-[rgba(0,148,197,0.1)] text-[#0094c5]' : 'bg-[#f5f5f5] text-[#6a6a6a]'}`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {GROUPS.map((group) => {
          const items = visible.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="flex flex-col gap-[10px] items-start shrink-0 w-full">
              <p className="font-semibold leading-[22px] text-[14px] text-[#111] w-full">{group}</p>
              {items.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onClick={() => onOpenNotification(notification)} />
              ))}
            </div>
          );
        })}

        {!visible.length && (
          <p className="font-medium leading-[18px] py-[24px] text-[12px] text-[#6a6a6a] text-center w-full">No notifications here.</p>
        )}
      </div>
    </>
  );
}
