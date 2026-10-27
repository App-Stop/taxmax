import { useCallback, useEffect, useRef, useState } from 'react';
import { getUnreadCount } from '../services/chat';
import { onChatEvent, onChatReconnect } from '../services/chatSocket';

const REFRESH_DELAY_MS = 800;

// Unread chat messages for the signed-in account ({ unreadMessages, unreadConversations }),
// refreshed when messages arrive or are read. Failures keep the last known count.
export default function useChatUnread(enabled = true) {
  const [counts, setCounts] = useState({ unreadMessages: 0, unreadConversations: 0 });
  const timer = useRef(null);

  const refresh = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      getUnreadCount().then(setCounts, () => {});
    }, REFRESH_DELAY_MS);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    getUnreadCount().then(setCounts, () => {});
    const offs = [onChatEvent('chat:message', refresh), onChatEvent('chat:read', refresh), onChatReconnect(refresh)];
    return () => {
      offs.forEach((off) => off());
      clearTimeout(timer.current);
    };
  }, [enabled, refresh]);

  return { ...counts, refresh };
}
