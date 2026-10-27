import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/api';
import {
  openConversation,
  listMessages,
  markConversationRead,
  sendMessage,
  editMessage,
  deleteMessage,
  uploadAttachments,
  newClientMessageId,
} from '../services/chat';
import { onChatEvent, onChatReconnect, sendTyping } from '../services/chatSocket';

const PAGE = 30;
const TYPING_TTL_MS = 6000;
const READ_DELAY_MS = 600;

const byTime = (a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a._id || '').localeCompare(String(b._id || ''));

// Same message: the server id, or (for our own optimistic copy) the clientMessageId we chose.
const sameMessage = (a, b) =>
  (a._id && b._id && a._id === b._id) ||
  (a.clientMessageId && a.clientMessageId === b.clientMessageId && String(a.sender?._id) === String(b.sender?._id));

// Adds or replaces messages, keeping the thread in time order.
function merge(list, incoming) {
  const next = [...list];
  incoming.forEach((message) => {
    const at = next.findIndex((m) => sameMessage(m, message));
    if (at === -1) next.push(message);
    // A server copy carries no local fields, so it also clears "Sending…" / "Failed".
    else next[at] = message;
  });
  return next.sort(byTime);
}

const without = (obj, key) => {
  const next = { ...obj };
  delete next[key];
  return next;
};

const lastServerId = (messages) => [...messages].reverse().find((m) => m._id)?._id;

// The send was refused because the customer's account is deactivated (409): nothing can be
// written to the thread until an admin reactivates it.
const isWriteBlocked = (err) => err instanceof ApiError && err.status === 409 && /deactivated/i.test(err.message);

/**
 * One chat thread, kept live.
 * customerId: 'me' for the signed-in customer, or a customer's id for the team.
 * viewer: { id, isTeam, name, type } — who is reading, to tell own messages apart.
 */
export default function useChatThread(customerId, viewer) {
  const [state, setState] = useState({ status: 'loading', error: null });
  const [info, setInfo] = useState(null); // { customer, participants }
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [older, setOlder] = useState({ loading: false, error: null });
  const [readAt, setReadAt] = useState({ customer: null, team: null });
  const [typing, setTyping] = useState({}); // senderId -> { name, until }
  const [writeBlocked, setWriteBlocked] = useState(null);
  const [nonce, setNonce] = useState(0);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const readTimer = useRef(null);
  const uploaded = useRef(new Map()); // clientMessageId -> attachments already in storage

  const isMine = useCallback((message) => String(message.sender?._id) === String(viewer.id), [viewer.id]);
  const fromOtherSide = useCallback(
    (message) => (viewer.isTeam ? message.sender?.type === 'customer' : message.sender?.type !== 'customer'),
    [viewer.isTeam],
  );
  // Events carry the customer's real id; a customer's own socket only gets their thread.
  const isThisThread = useCallback((payload) => customerId === 'me' || String(payload?.customerId) === String(customerId), [customerId]);

  const scheduleRead = useCallback(() => {
    clearTimeout(readTimer.current);
    readTimer.current = setTimeout(() => {
      markConversationRead(customerId).catch(() => {});
    }, READ_DELAY_MS);
  }, [customerId]);

  // Load (or reload) the newest page. Opening marks the thread read.
  useEffect(() => {
    let active = true;
    setState({ status: 'loading', error: null });
    openConversation(customerId, { limit: PAGE }).then(
      (data) => {
        if (!active) return;
        setInfo({ customer: data.customer, participants: data.participants });
        setMessages((prev) => merge(prev.filter((m) => m.pending), data.messages));
        setHasMore(data.hasMore);
        setReadAt({ customer: data.customerReadAt, team: data.teamReadAt });
        setState({ status: 'ready', error: null });
      },
      (error) => active && setState({ status: 'error', error }),
    );
    return () => {
      active = false;
    };
  }, [customerId, nonce]);

  useEffect(() => () => clearTimeout(readTimer.current), []);

  // Live events for this thread.
  useEffect(() => {
    const offs = [
      onChatEvent('chat:message', (payload) => {
        if (!isThisThread(payload)) return;
        setMessages((list) => merge(list, [payload.message]));
        const senderId = String(payload.message.sender?._id);
        setTyping((t) => without(t, senderId));
        if (fromOtherSide(payload.message)) scheduleRead();
      }),
      onChatEvent('chat:message_updated', (payload) => isThisThread(payload) && setMessages((list) => merge(list, [payload.message]))),
      onChatEvent('chat:message_deleted', (payload) => isThisThread(payload) && setMessages((list) => merge(list, [payload.message]))),
      onChatEvent('chat:read', (payload) => {
        if (!isThisThread(payload)) return;
        setReadAt((r) => ({ ...r, [payload.side]: payload.at }));
      }),
      onChatEvent('chat:typing', (payload) => {
        if (!isThisThread(payload)) return;
        const id = String(payload.sender?._id);
        if (id === String(viewer.id)) return;
        setTyping((t) => {
          if (!payload.isTyping) return without(t, id);
          return { ...t, [id]: { name: payload.sender?.name, type: payload.sender?.type, until: Date.now() + TYPING_TTL_MS } };
        });
      }),
      // Back online: fetch whatever arrived while the connection was down.
      onChatReconnect(() => {
        const after = lastServerId(messagesRef.current);
        if (!after) return setNonce((n) => n + 1);
        listMessages(customerId, { after, limit: 100 }).then(
          (res) => {
            setMessages((list) => merge(list, res.data));
            if (res.pagination?.hasMore) setNonce((n) => n + 1);
            if (res.data.some(fromOtherSide)) scheduleRead();
          },
          () => {},
        );
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [customerId, isThisThread, fromOtherSide, scheduleRead, viewer.id]);

  // Typing indicators expire if the "stopped" event never comes.
  useEffect(() => {
    if (!Object.keys(typing).length) return undefined;
    const timer = setTimeout(() => setTyping((t) => Object.fromEntries(Object.entries(t).filter(([, v]) => v.until > Date.now()))), 1000);
    return () => clearTimeout(timer);
  }, [typing]);

  const loadOlder = useCallback(async () => {
    const before = messagesRef.current.find((m) => m._id)?._id;
    if (!before) return;
    setOlder({ loading: true, error: null });
    try {
      const res = await listMessages(customerId, { before, limit: PAGE });
      setMessages((list) => merge(list, res.data));
      setHasMore(res.pagination.hasMore);
      setOlder({ loading: false, error: null });
    } catch (error) {
      setOlder({ loading: false, error });
    }
  }, [customerId]);

  // Sends (or re-sends) a message: shown at once as "Sending…", replaced by the server copy.
  const deliver = useCallback(
    async (pending) => {
      const { clientMessageId, body, localFiles = [] } = pending;
      setMessages((list) => merge(list, [{ ...pending, pending: 'sending', error: null }]));
      try {
        let attachments = uploaded.current.get(clientMessageId);
        if (!attachments && localFiles.length) {
          attachments = await uploadAttachments(customerId, localFiles);
          uploaded.current.set(clientMessageId, attachments);
        }
        const saved = await sendMessage(customerId, { clientMessageId, body, attachments: attachments || [] });
        uploaded.current.delete(clientMessageId);
        setMessages((list) => merge(list, [saved]));
      } catch (error) {
        if (isWriteBlocked(error)) setWriteBlocked(error.message);
        setMessages((list) =>
          list.map((m) => (m.clientMessageId === clientMessageId && !m._id ? { ...m, pending: 'failed', error: error.message } : m)),
        );
      }
    },
    [customerId],
  );

  const send = useCallback(
    (body, files = []) => {
      const pending = {
        _id: null,
        clientMessageId: newClientMessageId(),
        sender: { _id: viewer.id, type: viewer.type, name: viewer.name },
        body: body || null,
        attachments: files.map((file) => ({ fileName: file.name, contentType: file.type, size: file.size, url: null })),
        localFiles: files,
        createdAt: new Date().toISOString(),
      };
      sendTyping(customerId, false);
      return deliver(pending);
    },
    [customerId, deliver, viewer.id, viewer.type, viewer.name],
  );

  const retry = useCallback((message) => deliver(message), [deliver]);

  const discard = useCallback((message) => {
    uploaded.current.delete(message.clientMessageId);
    setMessages((list) => list.filter((m) => !(m.clientMessageId === message.clientMessageId && !m._id)));
  }, []);

  // Edits and deletes throw so the caller can show why (e.g. the 15-minute edit window passed).
  const edit = useCallback(
    async (messageId, body) => {
      try {
        const saved = await editMessage(customerId, messageId, body);
        setMessages((list) => merge(list, [saved]));
      } catch (error) {
        if (isWriteBlocked(error)) setWriteBlocked(error.message);
        throw error;
      }
    },
    [customerId],
  );

  const remove = useCallback(
    async (messageId) => {
      try {
        const saved = await deleteMessage(customerId, messageId);
        setMessages((list) => merge(list, [saved]));
      } catch (error) {
        if (isWriteBlocked(error)) setWriteBlocked(error.message);
        throw error;
      }
    },
    [customerId],
  );

  // Seen by the other side: their read time is at or after the message.
  const isSeen = useCallback(
    (message) => {
      const at = viewer.isTeam ? readAt.customer : readAt.team;
      return Boolean(at && message.createdAt && new Date(at) >= new Date(message.createdAt));
    },
    [readAt, viewer.isTeam],
  );

  return {
    status: state.status,
    error: state.error,
    reload: () => setNonce((n) => n + 1),
    info,
    messages,
    hasMore,
    older,
    loadOlder,
    send,
    retry,
    discard,
    edit,
    remove,
    isMine,
    isSeen,
    typingNames: Object.values(typing).map((t) => t.name).filter(Boolean),
    writeBlocked,
    setTyping: (isTyping) => sendTyping(customerId, isTyping),
  };
}
