import { useState, useEffect, useRef } from 'react';
import { PREPARER } from './dashboardData';

const imgInfo = "/figma/dashboard/info.svg";
const imgPaperclip = "/figma/dashboard/paperclip.svg";
const imgPaperPlane = "/figma/dashboard/paper-plane.svg";

// Chat Screen (Node 71:2272)
export default function ChatView({ messages, onSend }) {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const handleAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) onSend(`Attachment: ${file.name}`);
    e.target.value = '';
  };

  return (
    <div className="flex justify-center px-[16px] lg:pl-0 lg:pr-[60px] pt-[8px] lg:pt-[80px] pb-[16px] lg:pb-0">
      <div className="relative bg-[rgba(255,255,255,0.6)] border border-[#f5f5f5] border-solid h-[calc(var(--vh)-120px)] lg:h-[calc(var(--vh)-160px)] min-h-[420px] overflow-clip rounded-[20px] shadow-[0px_0px_60px_0px_rgba(0,101,131,0.1)] w-full max-w-[664px] lg:w-[664px]" data-node-id="71:2272">
        {/* Messages (Node 71:2273) */}
        <div ref={listRef} className="absolute inset-0 overflow-y-auto [scrollbar-width:none] pt-[113px] pb-[114px]">
          <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="71:2273">
            {messages.map((message) =>
              message.from === 'me' ? (
                <div key={message.id} className="flex flex-col gap-[6px] items-end pl-[48px] sm:pl-[160px] pr-[16px] w-full">
                  <div className="bg-[#0094c5] flex items-center px-[14px] py-[10px] rounded-[20px] max-w-full">
                    <p className="font-medium leading-[22px] text-[14px] text-white [word-break:break-word]">{message.text}</p>
                  </div>
                  <div className="flex font-normal gap-[6px] items-start leading-[normal] text-[12px] text-[#6a6a6a] whitespace-nowrap">
                    <p>{message.time}</p>
                    <p>{message.receipt}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex flex-col gap-[6px] items-start pl-[16px] pr-[48px] sm:pr-[160px] w-full">
                  <div className="bg-[#f5f5f5] flex items-center justify-center px-[14px] py-[10px] rounded-[20px] w-full">
                    <p className="flex-[1_0_0] font-medium leading-[22px] min-w-px text-[14px] text-[#111] [word-break:break-word]">{message.text}</p>
                  </div>
                  <p className="font-normal leading-[normal] text-[12px] text-[#6a6a6a] whitespace-nowrap">{message.time}</p>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Header (Node 71:2308) */}
        <div className="absolute top-0 inset-x-0 backdrop-blur-[3px] bg-[rgba(255,255,255,0.8)] border-[#e8e8e8] border-b border-solid flex items-center justify-between px-[16px] py-[20px]" data-node-id="71:2308">
          <div className="flex gap-[10px] items-center shrink-0">
            <div className="relative shrink-0 size-[46px]">
              <div className="absolute inset-[-2.17%]">
                <img alt="" className="block max-w-none size-full" height="48" src={PREPARER.avatarLarge} width="48" />
              </div>
            </div>
            <div className="flex flex-col gap-[4px] items-start justify-center leading-[normal] shrink-0 whitespace-nowrap">
              <p className="font-bold text-[16px] text-[#111]">{PREPARER.name}</p>
              <p className="font-normal text-[12px] text-[#6a6a6a]">{PREPARER.role}</p>
            </div>
          </div>
          <div className="backdrop-blur-[10px] bg-white border border-[#f5f5f5] border-solid flex items-center justify-center overflow-clip rounded-[46px] shrink-0 size-[44px]" data-node-id="71:2315">
            <div className="relative shrink-0 size-[24px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInfo} />
            </div>
          </div>
        </div>

        {/* Composer (Node 71:2317) */}
        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 inset-x-0 backdrop-blur-[3px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[52.155%] to-[rgba(255,255,255,0.6)] flex flex-col items-start px-[16px] py-[32px]"
          data-node-id="71:2317"
        >
          <div className="drop-shadow-[0px_6px_15px_rgba(0,0,0,0.1)] flex gap-[6px] items-start justify-end w-full">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttach} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach a file"
              className="backdrop-blur-[10px] bg-[#fafafa] border border-white border-solid flex items-center justify-center overflow-clip rounded-[46px] shrink-0 size-[50px] cursor-pointer"
            >
              <span className="relative shrink-0 size-[24px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPaperclip} />
              </span>
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message"
              aria-label="Message"
              className="backdrop-blur-[10px] bg-[#fafafa] border border-white border-solid flex-[1_0_0] h-[50px] min-w-px px-[14px] rounded-[46px] font-normal leading-[normal] text-[14px] text-[#111] placeholder:text-[#848484] outline-none"
              data-node-id="71:2321"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="bg-[#0094c5] hover:bg-[#0082ad] transition-colors flex items-center justify-center rounded-[100px] self-stretch shrink-0 w-[60px] cursor-pointer"
              data-node-id="71:2323"
            >
              <span className="relative shrink-0 size-[24px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPaperPlane} />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
