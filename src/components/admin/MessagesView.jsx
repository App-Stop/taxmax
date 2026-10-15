import { useState, useRef, useEffect, useMemo } from 'react';
import { Icon, Avatar, StatusBadge, SearchField, PageHeader, Popover } from './ui';
import { QUICK_REPLIES, initialsOf } from './adminData';

const A = '/figma/admin';

function ConversationRow({ conversation, client, active, onSelect }) {
  const last = conversation.messages[conversation.messages.length - 1];
  const unread = conversation.unread && !active;
  const muted = unread ? 'text-[#111]' : 'text-[#6a6a6a]';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      className={`border-[#e8e8e8] border-b border-solid flex gap-[6px] items-center px-[14px] py-[16px] relative shrink-0 w-full text-left cursor-pointer transition-colors ${active ? 'bg-[rgba(0,148,197,0.1)]' : 'hover:bg-[#fafafa]'}`}
    >
      <Avatar name={client.name} size={40} />
      <span className="flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center leading-[normal] min-w-px whitespace-nowrap">
        <span className="flex gap-[8px] items-center justify-between w-full">
          <span className={`overflow-hidden text-[14px] text-[#111] text-ellipsis ${active ? 'font-semibold' : 'font-medium'}`}>{client.name}</span>
          <span className={`font-normal shrink-0 text-[12px] ${muted}`}>{conversation.updatedAt}</span>
        </span>
        <span className={`font-normal max-w-full overflow-hidden text-[12px] text-ellipsis ${muted}`}>{last?.text}</span>
      </span>
      {unread && (
        <span className="-translate-x-1/2 -translate-y-1/2 absolute left-[7px] size-[6px] top-[calc(50%+0.5px)]">
          <img alt="Unread" className="absolute block inset-0 max-w-none size-full" src={`${A}/unread-dot.svg`} />
        </span>
      )}
    </button>
  );
}

function MessageBubble({ message }) {
  if (message.from === 'staff') {
    return (
      <div className="flex flex-col gap-[6px] items-end pl-[48px] pr-[16px] w-full">
        <div className="bg-[#0094c5] flex items-center justify-center max-w-[400px] px-[14px] py-[10px] rounded-[20px]">
          <p className="font-medium leading-[22px] text-[14px] text-white [word-break:break-word]">{message.text}</p>
        </div>
        <div className="flex font-normal gap-[6px] items-start leading-[normal] text-[12px] text-[#6a6a6a] whitespace-nowrap">
          <p>{message.time}</p>
          {message.receipt && <p>{message.receipt}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[6px] items-start pl-[16px] pr-[48px] w-full">
      <div className="bg-[#f5f5f5] flex items-center justify-center max-w-[400px] px-[14px] py-[10px] rounded-[20px]">
        <p className="font-normal leading-[22px] text-[14px] text-[#111] [word-break:break-word]">{message.text}</p>
      </div>
      <p className="font-normal leading-[normal] text-[12px] text-[#6a6a6a] whitespace-nowrap">{message.time}</p>
    </div>
  );
}

function ChatPanel({ conversation, client, onSend, onOpenClient, onMarkUnread }) {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [conversation.messages.length]);

  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const attach = (e) => {
    const file = e.target.files?.[0];
    if (file) onSend(`Attachment: ${file.name}`);
    e.target.value = '';
  };

  return (
    <div className="bg-white flex flex-[1_0_0] flex-col items-start min-h-[520px] lg:min-h-0 min-w-px rounded-[20px] self-stretch" data-node-id="87:2997">
      <div className="border-[#e8e8e8] border-b border-solid flex gap-[10px] items-center justify-between p-[16px] shrink-0 w-full">
        <div className="flex gap-[14px] items-center min-w-0">
          <span className="bg-[#e8e8e8] flex items-center justify-center rounded-[262.5px] shrink-0 size-[42px]">
            <span className="font-medium leading-[23.625px] text-[15.75px] text-[#6a6a6a] whitespace-nowrap">{initialsOf(client.name)}</span>
          </span>
          <div className="flex flex-col gap-[4px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
            <p className="font-semibold max-w-full overflow-hidden text-[16px] text-[#111] text-ellipsis">{client.name}</p>
            <p className="font-normal text-[12px] text-[#6a6a6a]">{conversation.submissionId}</p>
          </div>
        </div>
        <div className="flex gap-[10px] items-center justify-center shrink-0">
          <StatusBadge status={client.status} />
          <button
            type="button"
            onClick={onOpenClient}
            aria-label="View client submissions"
            className="bg-[#f5f5f5] flex items-center justify-center p-[10px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#ececec]"
          >
            <Icon src={`${A}/files.svg`} size={20} />
          </button>
          <Popover
            align="right"
            items={[
              { key: 'profile', label: 'View client profile', onSelect: onOpenClient },
              { key: 'unread', label: 'Mark as unread', onSelect: onMarkUnread },
            ]}
            trigger={({ toggle, open }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="More actions"
                aria-expanded={open}
                className="bg-[#f5f5f5] flex items-center justify-center p-[10px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#ececec]"
              >
                <Icon src={`${A}/dots-three-20.svg`} size={20} />
              </button>
            )}
          />
        </div>
      </div>

      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto w-full pt-[30px] pb-[10px] [scrollbar-width:thin]">
        <div className="flex flex-col gap-[20px] items-start w-full">
          {conversation.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-[10px] items-end justify-center p-[16px] shrink-0 w-full">
        <div className="flex flex-wrap justify-end gap-[10px] items-start">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply.label}
              type="button"
              onClick={() => {
                setDraft(reply.text);
                inputRef.current?.focus();
              }}
              className="border border-[#dcdcdc] border-solid flex items-center justify-center px-[14px] py-[10px] rounded-[20px] shrink-0 cursor-pointer hover:bg-[#fafafa]"
            >
              <span className="font-normal leading-[normal] text-[12px] text-[#111] whitespace-nowrap">{reply.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-[10px] h-[46px] items-center w-full">
          <div className="backdrop-blur-[10px] bg-white border border-[#e8e8e8] border-solid flex flex-[1_0_0] gap-[20px] h-[46px] items-center min-w-px px-[16px] py-[2px] rounded-[100px] focus-within:border-[#0094c5] transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type message..."
              aria-label="Message"
              className="flex-[1_0_0] min-w-px bg-transparent outline-none font-normal leading-[normal] text-[14px] text-[#111] placeholder:text-[#848484]"
            />
            <input ref={fileRef} type="file" className="hidden" onChange={attach} />
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach a file" className="shrink-0 cursor-pointer opacity-90 hover:opacity-100">
              <Icon src={`${A}/paperclip.svg`} />
            </button>
          </div>
          <button
            type="submit"
            aria-label="Send message"
            className="bg-[#0094c5] hover:bg-[#0082ad] transition-colors flex h-full items-center justify-center rounded-[100px] shrink-0 w-[60px] cursor-pointer"
          >
            <Icon src={`${A}/paper-plane-white.svg`} />
          </button>
        </div>
      </form>
    </div>
  );
}

// Messages (Node 87:2886)
export default function MessagesView({ conversations, clientsById, activeClientId, onSelect, onSend, onOpenClient, onMarkUnread }) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const client = clientsById[c.clientId];
      return client.name.toLowerCase().includes(q) || c.submissionId.toLowerCase().includes(q);
    });
  }, [conversations, clientsById, query]);

  const active = conversations.find((c) => c.clientId === activeClientId) || conversations[0];

  return (
    <div className="flex flex-col gap-[20px] items-start w-full lg:flex-1 lg:min-h-0" data-node-id="87:2934">
      <PageHeader title="Messages" subtitle="Secure client-staff conversations tied to submissions" />

      <div className="flex flex-col lg:flex-row gap-[10px] items-stretch w-full lg:flex-1 lg:min-h-[560px]" data-node-id="87:2939">
        <div className="bg-white flex flex-col gap-[10px] items-start max-h-[420px] lg:max-h-none py-[16px] rounded-[20px] shrink-0 lg:w-[349px]" data-node-id="87:2940">
          <div className="flex flex-col gap-[10px] items-start px-[16px] w-full">
            <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Conversations</p>
            <SearchField value={query} onChange={setQuery} placeholder="Search customers..." className="w-full" />
          </div>
          <div className="flex flex-col items-start min-h-0 overflow-y-auto w-full [scrollbar-width:thin]">
            {visible.map((c) => (
              <ConversationRow
                key={c.clientId}
                conversation={c}
                client={clientsById[c.clientId]}
                active={active && c.clientId === active.clientId}
                onSelect={() => onSelect(c.clientId)}
              />
            ))}
            {visible.length === 0 && <p className="px-[16px] py-[20px] text-[14px] text-[#6a6a6a]">No conversations found.</p>}
          </div>
        </div>

        {active && (
          <ChatPanel
            key={active.clientId}
            conversation={active}
            client={clientsById[active.clientId]}
            onSend={(text) => onSend(active.clientId, text)}
            onOpenClient={() => onOpenClient(active.clientId)}
            onMarkUnread={() => onMarkUnread(active.clientId)}
          />
        )}
      </div>
    </div>
  );
}
