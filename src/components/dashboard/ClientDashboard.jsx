import { useState, useCallback, useMemo } from 'react';
import useDesignScale from '../../hooks/useDesignScale';
import useApiQuery from '../../hooks/useApiQuery';
import useChatUnread from '../../hooks/useChatUnread';
import { getCustomerDashboard } from '../../services/dashboard';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notifications';
import DashboardSidebar from './DashboardSidebar';
import HomeView from './HomeView';
import ChatView from './ChatView';
import ProfileView from './ProfileView';
import NotificationsPanel from './NotificationsPanel';
import DocumentViewModal from './DocumentViewModal';
import { toDashboardDocument, toRecentUpdate, toNotification, preparerFor } from './dashboardData';

const RECENT_UPDATES_SHOWN = 2;

const imgWaves = "/figma/dashboard/waves.svg";
const imgBell = "/figma/dashboard/bell.svg";

// Customer dashboard (Figma 71:1760 Home, 71:2266 Chat, 71:2348 Profile).
// `documentsVersion` changes when documents were added elsewhere (the upload flow), to reload them.
export default function ClientDashboard({ user, documentsVersion = 0, onLogout, onBackToHome, onOpenUpload, onViewTaxTools }) {
  const { isDesktop, scale, width, height } = useDesignScale();
  const [tab, setTab] = useState('home'); // 'home' | 'chat' | 'profile'
  // Always fetched: image links in the list expire, so they are never cached across sessions.
  const dashboardQuery = useApiQuery(`customer-dashboard#${documentsVersion}`, () => getCustomerDashboard());
  const dashboard = dashboardQuery.data;
  const documents = useMemo(() => (dashboard?.documents || []).map(toDashboardDocument), [dashboard]);
  const recentUpdates = useMemo(() => (dashboard?.recentUpdates || []).map(toRecentUpdate), [dashboard]);
  const [viewedDocId, setViewedDocId] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unread = useChatUnread();
  // Who is reading chat, so own messages can be told apart.
  const viewer = useMemo(() => ({ id: user?.id, isTeam: false, type: 'customer', name: user?.fullName }), [user?.id, user?.fullName]);

  // Notifications: fetched for the bell's dot, refreshed each time the panel opens.
  const [notificationsVersion, setNotificationsVersion] = useState(0);
  const notificationsQuery = useApiQuery(`notifications#${notificationsVersion}`, listNotifications);
  // Read locally ahead of the server ('all' after "Mark all read"), for the list they were
  // marked in only: the next fetch carries the server's state. Undone if the request fails.
  const [localRead, setLocalRead] = useState({ list: null, ids: new Set() });
  const [notificationError, setNotificationError] = useState('');
  const readIds = localRead.list === notificationsQuery.data ? localRead.ids : null;
  const notifications = useMemo(
    () =>
      (notificationsQuery.data || [])
        .map(toNotification)
        .map((n) => (readIds && (readIds.has('all') || readIds.has(n.id)) ? { ...n, unread: false } : n)),
    [notificationsQuery.data, readIds],
  );

  const changeRead = (id, read) =>
    setLocalRead((prev) => {
      const ids = new Set(prev.list === notificationsQuery.data ? prev.ids : []);
      if (read) ids.add(id);
      else ids.delete(id);
      return { list: notificationsQuery.data, ids };
    });
  const forgetRead = (id) => changeRead(id, false);

  const openNotification = (notification) => {
    if (!notification.unread) return;
    setNotificationError('');
    changeRead(notification.id, true);
    markNotificationRead(notification.id).catch((err) => {
      forgetRead(notification.id);
      setNotificationError(err.message);
    });
  };

  const markAllRead = () => {
    setNotificationError('');
    changeRead('all', true);
    markAllNotificationsRead().then(
      () => setNotificationsVersion((v) => v + 1),
      (err) => {
        forgetRead('all');
        setNotificationError(err.message);
      },
    );
  };

  const selectTab = (next) => {
    setTab(next);
    setNotificationsOpen(false);
    // Coming back home: refresh the new-message count the chat may have cleared.
    if (next === 'home') dashboardQuery.reload();
    window.scrollTo({ top: 0 });
  };

  const closeDocument = useCallback(() => setViewedDocId(null), []);

  // A deleted document leaves the viewer; any other change only refreshes the list.
  const handleDocumentDeleted = () => {
    setViewedDocId(null);
    dashboardQuery.reload();
  };

  const toggleNotifications = () => {
    if (!notificationsOpen) {
      setNotificationError('');
      setNotificationsVersion((v) => v + 1);
    }
    setNotificationsOpen((open) => !open);
  };
  const hasUnreadNotifications = notifications.some((n) => n.unread);

  return (
    <div
      className="relative flex flex-col lg:flex-row bg-white font-['Manrope',sans-serif] text-[#111] overflow-x-clip"
      style={
        isDesktop
          ? { zoom: scale, width, minHeight: height, '--vh': `${height}px` }
          : { minHeight: '100dvh', '--vh': '100dvh' }
      }
      data-node-id="71:1760"
    >
      {/* Waves (Node 71:1761) */}
      <div className="absolute flex h-[586px] items-center justify-center inset-x-0 top-0 pointer-events-none" data-node-id="71:1761">
        <div className="flex-none rotate-180 w-full">
          <div className="blur-[60px] h-[586px] opacity-40 relative w-full">
            <div className="absolute inset-[34.97%_-24.27%_-10.2%_-11.7%]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWaves} />
            </div>
          </div>
        </div>
      </div>

      <DashboardSidebar
        activeTab={tab}
        onSelectTab={selectTab}
        onBackToHome={onBackToHome}
        onToggleNotifications={toggleNotifications}
        unreadMessages={tab === 'chat' ? 0 : unread.unreadMessages}
        hasUnreadNotifications={hasUnreadNotifications}
      />

      <main className="relative flex-1 min-w-0">
        {tab === 'home' && (
          <HomeView
            documents={documents}
            documentsLoading={dashboardQuery.loading && !dashboard}
            documentsError={dashboardQuery.error?.message}
            onRetryDocuments={dashboardQuery.reload}
            preparer={preparerFor(user, dashboard?.assignedPreparers)}
            updates={recentUpdates.slice(0, RECENT_UPDATES_SHOWN)}
            newMessageCount={unread.unreadMessages}
            onOpenDocument={setViewedDocId}
            onOpenUpload={onOpenUpload}
            onContact={() => selectTab('chat')}
            onViewTaxTools={onViewTaxTools}
          />
        )}
        {tab === 'chat' && <ChatView viewer={viewer} />}
        {tab === 'profile' && <ProfileView user={user} onLogout={onLogout} />}
      </main>

      {/* Bell (Node 71:2243) */}
      <button
        type="button"
        onClick={toggleNotifications}
        aria-label="Notifications"
        aria-expanded={notificationsOpen}
        className="hidden lg:flex absolute z-40 bg-white cursor-pointer items-center justify-center right-[30px] rounded-[100px] size-[40px] top-[30px]"
        data-node-id="71:2243"
      >
        <div className="relative shrink-0 size-[24px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBell} />
          {hasUnreadNotifications && <span aria-label="Unread notifications" className="absolute -top-[2px] -right-[2px] bg-[#ea0101] rounded-full size-[8px] ring-2 ring-white" />}
        </div>
      </button>

      {notificationsOpen && (
        <NotificationsPanel
          notifications={notifications}
          status={{ loading: notificationsQuery.loading, error: notificationsQuery.error, onRetry: notificationsQuery.reload }}
          actionError={notificationError}
          onOpenNotification={openNotification}
          onMarkAllRead={markAllRead}
          onClose={() => setNotificationsOpen(false)}
        />
      )}

      {viewedDocId && (
        <DocumentViewModal
          documents={documents}
          docId={viewedDocId}
          onSelectDocument={setViewedDocId}
          onChanged={dashboardQuery.reload}
          onDeleted={handleDocumentDeleted}
          onClose={closeDocument}
        />
      )}
    </div>
  );
}
