import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EDIT_WINDOW_MS, MAX_MESSAGE_LENGTH } from '../../services/chat';

const timeOf = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');

const dayOf = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Short type tag for non-image attachments.
const FileBadge = ({ type }) => (
  <span className="flex items-center justify-center shrink-0 rounded-[6px] bg-[#ffecec] text-[#ea0101] font-bold text-[10px] w-[32px] h-[32px]">
    {type === 'application/pdf' ? 'PDF' : 'FILE'}
  </span>
);

const sizeLabel = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function Attachments({ attachments, onRight }) {
  if (!attachments?.length) return null;
  return (
    <div className={`flex flex-wrap gap-[6px] ${onRight ? 'justify-end' : ''}`}>
      {attachments.map((file, i) => {
        const isImage = file.contentType?.startsWith('image/') && !/hei[cf]/.test(file.contentType);
        if (file.url && isImage) {
          return (
            <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer" className="block rounded-[12px] overflow-hidden border border-[#e8e8e8]">
              <img src={file.url} alt={file.fileName} className="block max-w-[220px] max-h-[180px] object-cover" />
            </a>
          );
        }
        const chip = (
          <span className="flex flex-col leading-[normal] min-w-0">
            <span className="font-medium text-[13px] text-[#111] truncate max-w-[200px]">{file.fileName}</span>
            <span className="text-[11px] text-[#6a6a6a]">{file.url ? sizeLabel(file.size) : 'Uploading…'}</span>
          </span>
        );
        return file.url ? (
          <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[8px] bg-white border border-[#e8e8e8] rounded-[12px] px-[10px] py-[8px] hover:bg-[#fafafa]">
            <FileBadge type={file.contentType} />
            {chip}
          </a>
        ) : (
          <span key={`${file.fileName}-${i}`} className="flex items-center gap-[8px] bg-white border border-[#e8e8e8] rounded-[12px] px-[10px] py-[8px] opacity-70">
            <FileBadge type={file.contentType} />
            {chip}
          </span>
        );
      })}
    </div>
  );
}

const linkButton = 'font-semibold text-[12px] cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-default';

function OwnActions({ message, thread, onError }) {
  const [mode, setMode] = useState(null); // 'edit' | 'confirm-delete'
  const [draft, setDraft] = useState(message.body || '');
  const [busy, setBusy] = useState(false);
  // Checked against when the actions appeared; the server has the final say on the 15-minute window.
  const [shownAt] = useState(() => Date.now());
  const canEdit = Boolean(message.body) && shownAt - new Date(message.createdAt).getTime() < EDIT_WINDOW_MS;

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
      setMode(null);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'edit') {
    return (
      <form
        className="flex flex-col gap-[6px] items-end w-full max-w-[400px]"
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft.trim();
          if (!text || text === message.body) return setMode(null);
          run(() => thread.edit(message._id, text));
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={2}
          autoFocus
          aria-label="Edit message"
          className="w-full border border-[#dcdcdc] focus:border-[#0094c5] rounded-[12px] p-[8px] text-[14px] text-[#111] outline-none resize-none"
        />
        <div className="flex gap-[12px]">
          <button type="button" onClick={() => setMode(null)} className={`${linkButton} text-[#6a6a6a]`}>Cancel</button>
          <button type="submit" disabled={busy} className={`${linkButton} text-[#0094c5]`}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    );
  }

  if (mode === 'confirm-delete') {
    return (
      <span className="flex gap-[10px] items-center text-[12px] text-[#444]">
        Delete this message?
        <button type="button" disabled={busy} onClick={() => run(() => thread.remove(message._id))} className={`${linkButton} text-[#ea0101]`}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
        <button type="button" onClick={() => setMode(null)} className={`${linkButton} text-[#6a6a6a]`}>Keep</button>
      </span>
    );
  }

  return (
    <span className="flex gap-[10px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
      {canEdit && (
        <button type="button" onClick={() => { setDraft(message.body); setMode('edit'); }} className={`${linkButton} text-[#0094c5]`}>Edit</button>
      )}
      <button type="button" onClick={() => setMode('confirm-delete')} className={`${linkButton} text-[#ea0101]`}>Delete</button>
    </span>
  );
}

function Message({ message, thread, viewerIsTeam, showSender }) {
  const [actionError, setActionError] = useState('');
  const teamSide = message.sender?.type !== 'customer';
  const onRight = viewerIsTeam ? teamSide : !teamSide;
  const mine = thread.isMine(message);
  const deleted = message.isDeleted;

  let receipt = null;
  if (mine) {
    if (message.pending === 'sending') receipt = 'Sending…';
    else if (message.pending !== 'failed') receipt = thread.isSeen(message) ? 'Read' : 'Delivered';
  }

  return (
    <div className={`group flex flex-col gap-[6px] w-full ${onRight ? 'items-end pl-[48px] pr-[16px]' : 'items-start pl-[16px] pr-[48px]'}`}>
      {showSender && message.sender?.name && (
        <p className="font-semibold text-[12px] text-[#6a6a6a]">
          {message.sender.name}
          {message.sender.roleName ? ` · ${message.sender.roleName}` : ''}
        </p>
      )}
      {deleted ? (
        <div className="border border-dashed border-[#dcdcdc] px-[14px] py-[10px] rounded-[20px]">
          <p className="italic text-[14px] text-[#848484]">This message was deleted</p>
        </div>
      ) : (
        <>
          {message.body && (
            <div className={`max-w-[400px] px-[14px] py-[10px] rounded-[20px] ${onRight ? 'bg-[#0094c5]' : 'bg-[#f5f5f5]'} ${message.pending === 'failed' ? 'opacity-60' : ''}`}>
              <p className={`leading-[22px] text-[14px] whitespace-pre-wrap [word-break:break-word] ${onRight ? 'font-medium text-white' : 'font-normal text-[#111]'}`}>{message.body}</p>
            </div>
          )}
          <Attachments attachments={message.attachments} onRight={onRight} />
        </>
      )}
      <div className="flex flex-wrap font-normal gap-[6px] items-center leading-[normal] text-[12px] text-[#6a6a6a]">
        <span>{timeOf(message.createdAt)}</span>
        {message.isEdited && !deleted && <span>· Edited</span>}
        {receipt && <span>· {receipt}</span>}
        {mine && !deleted && message._id && <OwnActions message={message} thread={thread} onError={setActionError} />}
      </div>
      {message.pending === 'failed' && (
        <p role="alert" className="flex flex-wrap gap-[10px] items-center text-[12px] text-[#ea0101]">
          Not sent: {message.error}
          <button type="button" onClick={() => thread.retry(message)} className={`${linkButton} text-[#0094c5]`}>Retry</button>
          <button type="button" onClick={() => thread.discard(message)} className={`${linkButton} text-[#6a6a6a]`}>Discard</button>
        </p>
      )}
      {actionError && (
        <p role="alert" className="text-[12px] text-[#ea0101]">
          {actionError}{' '}
          <button type="button" onClick={() => setActionError('')} className={`${linkButton} text-[#6a6a6a]`}>Dismiss</button>
        </p>
      )}
    </div>
  );
}

// The scrolling list of one thread: older history on demand, day separators, receipts,
// own-message edit/delete, failed sends with retry, and who is typing.
export default function ChatMessages({ thread, viewerIsTeam, className = '', innerClassName = '', emptyText = 'No messages yet. Say hello!' }) {
  const listRef = useRef(null);
  const nearBottom = useRef(true);
  const prevHeight = useRef(0);
  const { messages } = thread;
  const lastKey = messages.length ? messages[messages.length - 1].clientMessageId || messages[messages.length - 1]._id : null;

  // Older history is added above: keep the view where it was.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (thread.older.loading === false && prevHeight.current && el.scrollHeight > prevHeight.current && !nearBottom.current) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
    }
    prevHeight.current = el.scrollHeight;
  }, [messages.length, thread.older.loading]);

  // New messages at the bottom: follow them if the reader is already near the bottom.
  useEffect(() => {
    const el = listRef.current;
    if (el && nearBottom.current) el.scrollTop = el.scrollHeight;
  }, [lastKey, thread.typingNames.length, thread.status]);

  const onScroll = () => {
    const el = listRef.current;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  return (
    <div ref={listRef} onScroll={onScroll} className={`overflow-y-auto [scrollbar-width:thin] ${className}`} aria-live="polite">
      <div className={`flex flex-col gap-[16px] items-start w-full ${innerClassName}`}>
        {thread.hasMore && (
          <div className="flex flex-col items-center gap-[6px] w-full">
            <button
              type="button"
              onClick={thread.loadOlder}
              disabled={thread.older.loading}
              className="bg-white border border-[#e8e8e8] px-[14px] py-[6px] rounded-[100px] text-[12px] font-medium text-[#111] cursor-pointer hover:bg-[#fafafa] disabled:opacity-60"
            >
              {thread.older.loading ? 'Loading…' : 'Load earlier messages'}
            </button>
            {thread.older.error && <p role="alert" className="text-[12px] text-[#ea0101]">{thread.older.error.message}</p>}
          </div>
        )}

        {thread.status === 'ready' && messages.length === 0 && <p className="w-full text-center text-[14px] text-[#6a6a6a] py-[20px]">{emptyText}</p>}

        {messages.map((message, i) => {
          const prev = messages[i - 1];
          const newDay = !prev || dayOf(prev.createdAt) !== dayOf(message.createdAt);
          // Name the sender when the other side has several people, and on a new run of messages.
          const showSender =
            message.sender?.type !== 'customer' &&
            !thread.isMine(message) &&
            (!prev || newDay || String(prev.sender?._id) !== String(message.sender?._id));
          return (
            <div key={message._id || message.clientMessageId} className="flex flex-col gap-[16px] w-full">
              {newDay && <p className="w-full text-center text-[11px] font-semibold uppercase tracking-[0.4px] text-[#848484]">{dayOf(message.createdAt)}</p>}
              <Message message={message} thread={thread} viewerIsTeam={viewerIsTeam} showSender={showSender} />
            </div>
          );
        })}

        {thread.typingNames.length > 0 && (
          <p className="pl-[16px] text-[12px] italic text-[#6a6a6a]" role="status">
            {thread.typingNames.join(', ')} {thread.typingNames.length > 1 ? 'are' : 'is'} typing…
          </p>
        )}
      </div>
    </div>
  );
}
