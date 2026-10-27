import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, Avatar, SearchField, PageHeader, Popover, ListState } from './ui';
import { QUICK_REPLIES, initialsOf } from './adminData';
import { relativeTime } from './adminApiMappers';
import ChatMessages from '../chat/ChatMessages';
import ChatComposer from '../chat/ChatComposer';
import { listConversations } from '../../services/chat';
import { onChatEvent, onChatReconnect, onChatStatus } from '../../services/chatSocket';
import useChatThread from '../../hooks/useChatThread';

const A = '/figma/admin';
const PAGE_LIMIT = 30;
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

function previewOf(last) {
  if (!last) return 'No messages yet';
  if (last.isDeleted) return 'Message deleted';
  const text = last.preview || (last.attachmentCount ? `${last.attachmentCount} attachment${last.attachmentCount > 1 ? 's' : ''}` : '');
  return last.senderType === 'customer' ? text : `${last.senderName || 'Team'}: ${text}`;
}

function ConversationRow({ conversation, active, onSelect }) {
  const unread = conversation.unreadCount > 0 && !active;
  const muted = unread ? 'text-[#111]' : 'text-[#6a6a6a]';
  const name = conversation.customer.fullName || 'Unnamed client';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      className={`border-[#e8e8e8] border-b border-solid flex gap-[6px] items-center px-[14px] py-[16px] relative shrink-0 w-full text-left cursor-pointer transition-colors ${active ? 'bg-[rgba(0,148,197,0.1)]' : 'hover:bg-[#fafafa]'}`}
    >
      <Avatar name={name} size={40} />
      <span className="flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center leading-[normal] min-w-px whitespace-nowrap">
        <span className="flex gap-[8px] items-center justify-between w-full">
          <span className={`overflow-hidden text-[14px] text-[#111] text-ellipsis ${active || unread ? 'font-semibold' : 'font-medium'}`}>{name}</span>
          <span className={`font-normal shrink-0 text-[12px] ${muted}`}>{conversation.lastMessageAt ? relativeTime(conversation.lastMessageAt) : 'New'}</span>
        </span>
        <span className="flex gap-[8px] items-center justify-between w-full">
          <span className={`font-normal max-w-full overflow-hidden text-[12px] text-ellipsis ${muted}`}>{previewOf(conversation.lastMessage)}</span>
          {unread && (
            <span className="bg-[#0094c5] text-white text-[10px] font-bold rounded-[100px] min-w-[18px] h-[18px] px-[5px] flex items-center justify-center shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function ChatPanel({ customerId, fallbackName, viewer, onOpenClient, onThreadRead }) {
  const thread = useChatThread(customerId, viewer);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const name = thread.info?.customer?.fullName || fallbackName || 'Client';
  const assignees = thread.info?.participants?.assignees || [];

  // Opening the thread marks it read on the server.
  useEffect(() => {
    if (thread.status === 'ready') onThreadRead(customerId);
  }, [thread.status, customerId, onThreadRead]);

  return (
    <div className="bg-white flex flex-[1_0_0] flex-col items-start min-h-[520px] lg:min-h-0 min-w-px rounded-[20px] self-stretch" data-node-id="87:2997">
      <div className="border-[#e8e8e8] border-b border-solid flex gap-[10px] items-center justify-between p-[16px] shrink-0 w-full">
        <div className="flex gap-[14px] items-center min-w-0">
          <span className="bg-[#e8e8e8] flex items-center justify-center rounded-[262.5px] shrink-0 size-[42px]">
            <span className="font-medium leading-[23.625px] text-[15.75px] text-[#6a6a6a] whitespace-nowrap">{initialsOf(name)}</span>
          </span>
          <div className="flex flex-col gap-[4px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
            <p className="font-semibold max-w-full overflow-hidden text-[16px] text-[#111] text-ellipsis">{name}</p>
            <p className="font-normal text-[12px] text-[#6a6a6a] max-w-full overflow-hidden text-ellipsis">
              {thread.info ? (assignees.length ? `Assigned: ${assignees.map((a) => a.fullName).join(', ')}` : 'No preparer assigned') : ' '}
            </p>
          </div>
        </div>
        <div className="flex gap-[10px] items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenClient({ id: customerId, name })}
            aria-label="View client submissions"
            className="bg-[#f5f5f5] flex items-center justify-center p-[10px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#ececec]"
          >
            <Icon src={`${A}/files.svg`} size={20} />
          </button>
          <Popover
            align="right"
            items={[{ key: 'profile', label: 'View client profile', onSelect: () => onOpenClient({ id: customerId, name }) }]}
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

      {thread.status === 'error' ? (
        <ListState className="flex-1 w-full" error={thread.error} onRetry={thread.reload} />
      ) : thread.status === 'loading' && !thread.messages.length ? (
        <ListState className="flex-1 w-full" loading />
      ) : (
        <ChatMessages thread={thread} viewerIsTeam className="flex-1 min-h-0 w-full" innerClassName="pt-[30px] pb-[10px]" emptyText="No messages yet. Start the conversation." />
      )}

      <ChatComposer
        variant="admin"
        inputRef={inputRef}
        draft={draft}
        onDraftChange={setDraft}
        onSend={thread.send}
        onTyping={thread.setTyping}
        blockedReason={thread.status === 'error' ? 'This conversation could not be loaded.' : thread.writeBlocked}
      >
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
      </ChatComposer>
    </div>
  );
}

// Messages (Node 87:2886). The inbox lists threads with at least one message, newest
// first (staff see only their assigned customers). `activeClient` ({ id, name }) opens a
// thread, including a new one with no messages yet.
export default function MessagesView({ viewer, activeClient, onSelect, onOpenClient }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [list, setList] = useState({ rows: [], page: 1, hasMore: false, loading: true, error: null, loadingMore: false });
  const [live, setLive] = useState(true);
  const reloadTimer = useRef(null);

  const load = useCallback(
    async (page) => {
      setList((l) => ({ ...l, ...(page === 1 ? { loading: true } : { loadingMore: true }), error: null }));
      try {
        const res = await listConversations({ page, limit: PAGE_LIMIT, unread: filter === 'unread' });
        setList((l) => ({
          rows: page === 1 ? res.data : [...l.rows, ...res.data.filter((r) => !l.rows.some((x) => x.customer._id === r.customer._id))],
          page,
          hasMore: res.pagination.hasMore,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (error) {
        setList((l) => ({ ...l, loading: false, loadingMore: false, error }));
      }
    },
    [filter],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const activeId = activeClient?.id || list.rows[0]?.customer._id || null;

  // Keep the inbox current: update the row a message belongs to, or reload when it's a new thread.
  useEffect(() => {
    const reloadSoon = () => {
      clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => load(1), 500);
    };
    const offs = [
      onChatEvent('chat:message', ({ customerId, message }) => {
        setList((l) => {
          const row = l.rows.find((r) => String(r.customer._id) === String(customerId));
          if (!row) {
            reloadSoon();
            return l;
          }
          const fromCustomer = message.sender?.type === 'customer';
          const updated = {
            ...row,
            lastMessage: {
              _id: message._id,
              senderType: message.sender?.type,
              senderName: message.sender?.name,
              preview: message.body,
              attachmentCount: message.attachments?.length || 0,
              isDeleted: false,
              at: message.createdAt,
            },
            lastMessageAt: message.createdAt,
            unreadCount: fromCustomer && String(customerId) !== String(activeId) ? row.unreadCount + 1 : row.unreadCount,
          };
          return { ...l, rows: [updated, ...l.rows.filter((r) => r !== row)] };
        });
      }),
      onChatEvent('chat:message_deleted', ({ customerId, message }) =>
        setList((l) => ({
          ...l,
          rows: l.rows.map((r) =>
            String(r.customer._id) === String(customerId) && r.lastMessage?._id === message._id
              ? { ...r, lastMessage: { ...r.lastMessage, isDeleted: true, preview: null, attachmentCount: 0 } }
              : r,
          ),
        })),
      ),
      onChatReconnect(reloadSoon),
      onChatStatus(setLive),
    ];
    return () => {
      offs.forEach((off) => off());
      clearTimeout(reloadTimer.current);
    };
  }, [load, activeId]);

  const markRowRead = useCallback(
    (customerId) => setList((l) => ({ ...l, rows: l.rows.map((r) => (String(r.customer._id) === String(customerId) ? { ...r, unreadCount: 0 } : r)) })),
    [],
  );

  // A thread opened from elsewhere ("Message client") may have no messages yet, so it isn't in the inbox.
  const rows = useMemo(() => {
    const known = list.rows.some((r) => String(r.customer._id) === String(activeClient?.id));
    const all = activeClient && !known && filter === 'all'
      ? [{ customer: { _id: activeClient.id, fullName: activeClient.name }, lastMessage: null, lastMessageAt: null, unreadCount: 0 }, ...list.rows]
      : list.rows;
    // The API has no conversation search; this filters the loaded threads by name.
    const q = query.trim().toLowerCase();
    return q ? all.filter((r) => (r.customer.fullName || '').toLowerCase().includes(q)) : all;
  }, [list.rows, activeClient, filter, query]);

  const activeName = activeClient?.id === activeId ? activeClient.name : list.rows.find((r) => r.customer._id === activeId)?.customer.fullName;

  return (
    <div className="flex flex-col gap-[20px] items-start w-full lg:flex-1 lg:min-h-0" data-node-id="87:2934">
      <PageHeader
        title="Messages"
        subtitle="Secure client-staff conversations tied to submissions"
        action={!live && <span className="text-[12px] font-medium text-[#e86907] bg-[#fff1e6] px-[10px] py-[6px] rounded-[100px]">Reconnecting… new messages may be delayed</span>}
      />

      <div className="flex flex-col lg:flex-row gap-[10px] items-stretch w-full lg:flex-1 lg:min-h-[560px]" data-node-id="87:2939">
        <div className="bg-white flex flex-col gap-[10px] items-start max-h-[420px] lg:max-h-none py-[16px] rounded-[20px] shrink-0 lg:w-[349px]" data-node-id="87:2940">
          <div className="flex flex-col gap-[10px] items-start px-[16px] w-full">
            <div className="flex items-center justify-between w-full">
              <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Conversations</p>
              <div role="tablist" aria-label="Filter conversations" className="bg-[#e8e8e8] flex p-[2px] rounded-[30px]">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-[12px] py-[4px] rounded-[20px] text-[12px] cursor-pointer ${filter === f.id ? 'bg-white font-semibold' : 'font-normal'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <SearchField value={query} onChange={setQuery} placeholder="Search customers..." className="w-full" />
          </div>
          <div className="flex flex-col items-start min-h-0 overflow-y-auto w-full [scrollbar-width:thin]">
            {rows.map((c) => (
              <ConversationRow
                key={c.customer._id}
                conversation={c}
                active={String(c.customer._id) === String(activeId)}
                onSelect={() => onSelect({ id: c.customer._id, name: c.customer.fullName })}
              />
            ))}
            {(list.error || list.loading || rows.length === 0) && (
              <ListState
                className="py-[20px] w-full"
                loading={list.loading}
                error={list.error}
                onRetry={() => load(1)}
                empty={query ? 'No loaded conversations match.' : filter === 'unread' ? 'No unread conversations.' : 'No conversations yet.'}
              />
            )}
            {list.hasMore && !list.error && (
              <button type="button" onClick={() => load(list.page + 1)} disabled={list.loadingMore} className="mx-auto my-[10px] text-[13px] font-semibold text-[#0094c5] cursor-pointer hover:underline disabled:opacity-60">
                {list.loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </div>

        {activeId ? (
          <ChatPanel key={activeId} customerId={activeId} fallbackName={activeName} viewer={viewer} onOpenClient={onOpenClient} onThreadRead={markRowRead} />
        ) : (
          !list.loading && (
            <div className="bg-white flex flex-[1_0_0] items-center justify-center rounded-[20px] min-h-[300px] text-[14px] text-[#6a6a6a]">
              Pick a conversation, or message a client from their profile.
            </div>
          )
        )}
      </div>
    </div>
  );
}
