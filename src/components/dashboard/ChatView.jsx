import useChatThread from '../../hooks/useChatThread';
import ChatMessages from '../chat/ChatMessages';
import ChatComposer from '../chat/ChatComposer';
import { initialsOf } from './dashboardData';

const imgInfo = "/figma/dashboard/info.svg";

// Chat Screen (Node 71:2272). The customer's one thread with their assigned preparers and
// the TaxMax team (GET/POST /chat/conversations/me), kept live over the chat socket.
export default function ChatView({ viewer }) {
  const thread = useChatThread('me', viewer);
  const assignees = thread.info?.participants?.assignees || [];
  const lead = assignees[0];
  const title = lead?.fullName || thread.info?.participants?.team || 'TaxMax Team';
  const subtitle = lead
    ? [lead.roleName, assignees.length > 1 ? `+${assignees.length - 1} more` : null].filter(Boolean).join(' · ')
    : 'A preparer will be assigned to you shortly';

  return (
    <div className="flex justify-center px-[16px] lg:pl-0 lg:pr-[60px] pt-[8px] lg:pt-[80px] pb-[16px] lg:pb-0">
      <div className="relative bg-[rgba(255,255,255,0.6)] border border-[#f5f5f5] border-solid h-[calc(var(--vh)-120px)] lg:h-[calc(var(--vh)-160px)] min-h-[420px] overflow-clip rounded-[20px] shadow-[0px_0px_60px_0px_rgba(0,101,131,0.1)] w-full max-w-[664px] lg:w-[664px]" data-node-id="71:2272">
        {/* Messages (Node 71:2273) */}
        {thread.status === 'error' ? (
          <div role="alert" className="absolute inset-0 flex flex-col gap-[12px] items-center justify-center px-[24px] text-center">
            <p className="font-medium text-[14px] text-[#ea0101]">{thread.error.message}</p>
            <button type="button" onClick={thread.reload} className="bg-white border border-[#e8e8e8] px-[16px] py-[8px] rounded-[100px] font-medium text-[14px] text-[#111] cursor-pointer hover:bg-[#fafafa]">
              Try again
            </button>
          </div>
        ) : thread.status === 'loading' && !thread.messages.length ? (
          <p className="absolute inset-0 flex items-center justify-center text-[14px] text-[#6a6a6a]" role="status">Loading your conversation…</p>
        ) : (
          <ChatMessages
            thread={thread}
            viewerIsTeam={false}
            className="absolute inset-0 [scrollbar-width:none]"
            innerClassName="pt-[113px] pb-[150px]"
            emptyText="Send your preparer a message. They'll reply here."
          />
        )}

        {/* Header (Node 71:2308) */}
        <div className="absolute top-0 inset-x-0 backdrop-blur-[3px] bg-[rgba(255,255,255,0.8)] border-[#e8e8e8] border-b border-solid flex items-center justify-between px-[16px] py-[20px]" data-node-id="71:2308">
          <div className="flex gap-[10px] items-center min-w-0">
            <div className="bg-[rgba(0,148,197,0.1)] flex items-center justify-center rounded-[100px] shrink-0 size-[46px]">
              <p className="font-extrabold text-[16px] text-[#0094c5]">{initialsOf({ fullName: title })}</p>
            </div>
            <div className="flex flex-col gap-[4px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
              <p className="font-bold text-[16px] text-[#111] truncate max-w-full">{title}</p>
              <p className="font-normal text-[12px] text-[#6a6a6a] truncate max-w-full">{thread.info ? subtitle : ' '}</p>
            </div>
          </div>
          <div className="backdrop-blur-[10px] bg-white border border-[#f5f5f5] border-solid flex items-center justify-center overflow-clip rounded-[46px] shrink-0 size-[44px]" data-node-id="71:2315">
            <div className="relative shrink-0 size-[24px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInfo} />
            </div>
          </div>
        </div>

        {/* Composer (Node 71:2317) */}
        <div className="absolute bottom-0 inset-x-0 backdrop-blur-[3px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[52.155%] to-[rgba(255,255,255,0.6)] px-[16px] py-[24px]" data-node-id="71:2317">
          <ChatComposer
            variant="customer"
            onSend={thread.send}
            onTyping={thread.setTyping}
            blockedReason={thread.status === 'error' ? 'Chat is unavailable right now.' : thread.writeBlocked}
          />
        </div>
      </div>
    </div>
  );
}
