import { useEffect, useRef, useState } from 'react';
import useApiQuery from '../../hooks/useApiQuery';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notifications';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import { toNotification } from '../dashboard/dashboardData';
import { Icon } from './ui';

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const triggerRef = useRef(null);
  const query = useApiQuery('team-notifications', listNotifications);
  const notifications = (query.data || []).map(toNotification);
  const hasUnread = notifications.some((notification) => notification.unread);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggle = () => {
    if (!open) {
      setActionError('');
      query.reload();
    }
    setOpen((value) => !value);
  };

  const markRead = async (notification) => {
    if (pending || query.loading || (notification && !notification.unread)) return;
    setPending(true);
    setActionError('');
    try {
      if (notification) await markNotificationRead(notification.id);
      else await markAllNotificationsRead();
      query.reload();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative bg-white flex items-center p-[14px] rounded-[60px] shrink-0 cursor-pointer"
      >
        <Icon src="/figma/admin/bell.svg" />
        {hasUnread && <span aria-label="Unread notifications" className="absolute top-[10px] right-[10px] bg-[#ea0101] rounded-full size-[8px] ring-2 ring-white" />}
      </button>
      {open && (
        <NotificationsPanel
          notifications={notifications}
          status={{ loading: query.loading, error: query.error, onRetry: query.reload }}
          actionError={actionError}
          readPending={pending || query.loading}
          onOpenNotification={markRead}
          onMarkAllRead={() => markRead()}
          onClose={close}
        />
      )}
    </>
  );
}
