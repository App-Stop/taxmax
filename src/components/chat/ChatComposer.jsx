import { useRef, useState } from 'react';
import { ATTACHMENT_TYPES, MAX_ATTACHMENTS, MAX_MESSAGE_LENGTH, attachmentProblem } from '../../services/chat';

const VARIANTS = {
  admin: {
    paperclip: '/figma/admin/paperclip.svg',
    send: '/figma/admin/paper-plane-white.svg',
    form: 'flex flex-col gap-[10px] items-end justify-center p-[16px] shrink-0 w-full',
    field: 'backdrop-blur-[10px] bg-white border border-[#e8e8e8] focus-within:border-[#0094c5] transition-colors flex flex-[1_0_0] gap-[12px] min-h-[46px] items-center min-w-px px-[16px] py-[2px] rounded-[100px]',
  },
  customer: {
    paperclip: '/figma/dashboard/paperclip.svg',
    send: '/figma/dashboard/paper-plane.svg',
    form: 'flex flex-col gap-[8px] items-stretch w-full',
    field: 'backdrop-blur-[10px] bg-[#fafafa] border border-white flex flex-[1_0_0] gap-[10px] min-h-[50px] items-center min-w-px px-[14px] rounded-[46px]',
  },
};

// Message input with attachments. `onSend(text, files)`; `children` sit above the input
// (quick replies). While `blockedReason` is set nothing can be sent.
export default function ChatComposer({ variant = 'admin', onSend, onTyping, blockedReason, inputRef, draft, onDraftChange, children }) {
  const v = VARIANTS[variant];
  const [ownDraft, setOwnDraft] = useState('');
  const [files, setFiles] = useState([]);
  const [problem, setProblem] = useState('');
  const fileRef = useRef(null);
  const typingRef = useRef(false);

  const text = draft ?? ownDraft;
  const setText = onDraftChange ?? setOwnDraft;

  const stopTyping = () => {
    if (typingRef.current) onTyping?.(false);
    typingRef.current = false;
  };

  const change = (value) => {
    setText(value);
    if (value && !typingRef.current) {
      typingRef.current = true;
      onTyping?.(true);
    } else if (value) {
      onTyping?.(true); // the server throttles repeats
    } else {
      stopTyping();
    }
  };

  const addFiles = (picked) => {
    const problems = picked.map(attachmentProblem).filter(Boolean);
    const ok = picked.filter((file) => !attachmentProblem(file));
    const room = MAX_ATTACHMENTS - files.length;
    if (ok.length > room) problems.push(`A message can have at most ${MAX_ATTACHMENTS} attachments.`);
    setFiles((list) => [...list, ...ok.slice(0, Math.max(room, 0))]);
    setProblem(problems.join(' '));
  };

  const submit = (e) => {
    e.preventDefault();
    if (blockedReason) return;
    const body = text.trim();
    if (!body && !files.length) return;
    onSend(body, files);
    setText('');
    setFiles([]);
    setProblem('');
    stopTyping();
  };

  return (
    <form onSubmit={submit} className={v.form}>
      {children}
      {blockedReason && <p role="alert" className="w-full text-[13px] font-medium text-[#b42318] bg-[#fff1f0] border border-[#fecdca] rounded-[12px] px-[12px] py-[8px]">{blockedReason}</p>}
      {problem && <p role="alert" className="w-full text-[12px] text-[#ea0101]">{problem}</p>}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-[6px] w-full">
          {files.map((file, i) => (
            <span key={`${file.name}-${i}`} className="flex items-center gap-[6px] bg-white border border-[#e8e8e8] rounded-[100px] pl-[10px] pr-[4px] py-[4px] text-[12px] text-[#111]">
              <span className="truncate max-w-[160px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                aria-label={`Remove ${file.name}`}
                className="size-[20px] rounded-full hover:bg-[#f5f5f5] cursor-pointer text-[#6a6a6a]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-[10px] items-stretch w-full">
        <div className={v.field}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => change(e.target.value)}
            onBlur={stopTyping}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={Boolean(blockedReason)}
            placeholder="Type message..."
            aria-label="Message"
            className="flex-[1_0_0] min-w-px bg-transparent outline-none font-normal leading-[normal] text-[14px] text-[#111] placeholder:text-[#848484] disabled:cursor-not-allowed"
          />
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ATTACHMENT_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              addFiles([...(e.target.files || [])]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={Boolean(blockedReason) || files.length >= MAX_ATTACHMENTS}
            aria-label="Attach files"
            className="shrink-0 cursor-pointer opacity-90 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <img alt="" src={v.paperclip} className="block size-[24px]" />
          </button>
        </div>
        <button
          type="submit"
          aria-label="Send message"
          disabled={Boolean(blockedReason) || (!text.trim() && !files.length)}
          className="bg-[#0094c5] hover:bg-[#0082ad] transition-colors flex items-center justify-center rounded-[100px] shrink-0 w-[60px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img alt="" src={v.send} className="block size-[24px]" />
        </button>
      </div>
    </form>
  );
}
