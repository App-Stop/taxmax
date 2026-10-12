import { useState, useCallback } from 'react';
import useDesignScale from '../../hooks/useDesignScale';
import DashboardSidebar from './DashboardSidebar';
import HomeView from './HomeView';
import ChatView from './ChatView';
import ProfileView from './ProfileView';
import NotificationsPanel from './NotificationsPanel';
import DocumentViewModal from './DocumentViewModal';
import { normalizeDocuments, buildMessages, buildNotifications, firstNameOf, formatTime } from './dashboardData';

const imgWaves = "/figma/dashboard/waves.svg";
const imgBell = "/figma/dashboard/bell.svg";

// Customer dashboard (Figma 71:1760 Home, 71:2266 Chat, 71:2348 Profile).
export default function ClientDashboard({ user, onLogout, onBackToHome, onOpenUpload, onViewTaxTools }) {
  const { isDesktop, scale, width, height } = useDesignScale();
  const [tab, setTab] = useState('home'); // 'home' | 'chat' | 'profile'
  const [documents, setDocuments] = useState(() => normalizeDocuments(user));
  const [messages, setMessages] = useState(() => buildMessages(firstNameOf(user)));
  const [notifications, setNotifications] = useState(() => buildNotifications(firstNameOf(user)));
  const [viewedDocId, setViewedDocId] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const markRead = (match) => {
    setNotifications((list) => list.map((n) => (match(n) ? { ...n, unread: false } : n)));
  };

  const selectTab = (next) => {
    setTab(next);
    setNotificationsOpen(false);
    if (next === 'chat') markRead((n) => n.kind === 'message');
    window.scrollTo({ top: 0 });
  };

  const openNotification = (notification) => {
    markRead((n) => n.id === notification.id);
    if (notification.kind === 'message') selectTab('chat');
  };

  const sendMessage = (text) => {
    setMessages((list) => [
      ...list,
      { id: `m${Date.now()}`, from: 'me', text, time: formatTime(new Date()), receipt: 'Delivered' },
    ]);
  };

  const changePages = (docId, pages) => {
    setDocuments((list) => list.map((doc) => (doc.id === docId ? { ...doc, pages } : doc)));
  };

  const closeDocument = useCallback(() => setViewedDocId(null), []);

  const retakeDocument = () => {
    setViewedDocId(null);
    onOpenUpload();
  };

  const toggleNotifications = () => setNotificationsOpen((open) => !open);

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

      <DashboardSidebar activeTab={tab} onSelectTab={selectTab} onBackToHome={onBackToHome} onToggleNotifications={toggleNotifications} />

      <main className="relative flex-1 min-w-0">
        {tab === 'home' && (
          <HomeView
            documents={documents}
            updates={notifications.filter((n) => n.kind === 'document').slice(0, 2)}
            newMessageCount={notifications.filter((n) => n.kind === 'message' && n.unread).length}
            onOpenDocument={setViewedDocId}
            onOpenUpload={onOpenUpload}
            onContact={() => selectTab('chat')}
            onViewTaxTools={onViewTaxTools}
          />
        )}
        {tab === 'chat' && <ChatView messages={messages} onSend={sendMessage} />}
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
        </div>
      </button>

      {notificationsOpen && (
        <NotificationsPanel
          notifications={notifications}
          onOpenNotification={openNotification}
          onMarkAllRead={() => markRead(() => true)}
          onClose={() => setNotificationsOpen(false)}
        />
      )}

      {viewedDocId && (
        <DocumentViewModal
          documents={documents}
          docId={viewedDocId}
          onSelectDocument={setViewedDocId}
          onPagesChange={changePages}
          onRetake={retakeDocument}
          onClose={closeDocument}
        />
      )}
    </div>
  );
}
