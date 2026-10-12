const imgUnreadDot = "/figma/dashboard/unread-dot.svg";

export default function NotificationItem({ notification, onClick }) {
  const { avatar, icon, title, body, time, unread } = notification;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`bg-[#f5f5f5] flex gap-[12px] items-start overflow-clip p-[16px] rounded-[20px] shrink-0 w-full text-left ${onClick ? 'cursor-pointer' : ''}`}
      data-name="Notification"
    >
      {avatar ? (
        <div className="relative shrink-0 size-[40px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full rounded-full" height="40" src={avatar} width="40" />
        </div>
      ) : (
        <div className="bg-white flex items-center justify-center overflow-clip rounded-[60px] shrink-0 size-[40px]">
          <div className="relative shrink-0 size-[22px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon} />
          </div>
        </div>
      )}
      <div className="flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip">
        <div className="flex gap-[8px] items-center overflow-clip w-full">
          <p className="flex-[1_0_0] font-bold leading-[20px] min-w-px text-[14px] text-[#111]">{title}</p>
          {unread && (
            <div className="relative shrink-0 size-[6px]">
              <img alt="Unread" className="absolute block inset-0 max-w-none size-full" src={imgUnreadDot} />
            </div>
          )}
        </div>
        <p className="font-medium leading-[18px] text-[12px] text-[#6a6a6a] w-full">{body}</p>
        <p className="font-normal leading-[16px] text-[10px] text-[#848484] whitespace-nowrap">{time}</p>
      </div>
    </Tag>
  );
}
