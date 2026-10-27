import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import useDesignScale from '../../hooks/useDesignScale';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import DashboardView from './DashboardView';
import SubmissionQueueView from './SubmissionQueueView';
import DocumentReviewView from './DocumentReviewView';
import ClientsDirectoryView from './ClientsDirectoryView';
import ClientDetailView from './ClientDetailView';
import MessagesView from './MessagesView';
import CampaignsView from './CampaignsView';
import CampaignModal from './CampaignModal';
import ActivityLogView from './ActivityLogView';
import SettingsView from './SettingsView';
import { Toast } from './ui';
import {
  INITIAL_CLIENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_REFERRALS,
  DEFAULT_SECURITY,
  REFERENCE_DATE,
  statusById,
} from './adminData';
import { getTeamMe } from '../../services/team';
import useChatUnread from '../../hooks/useChatUnread';

// Campaigns and referrals have no API yet; their dummy rows name these dummy clients.
const CAMPAIGN_CLIENTS_BY_ID = Object.fromEntries(INITIAL_CLIENTS.map((c) => [c.id, c]));

// `cursors`: see cursorPages.js. The queue's `range` is in days.
const DEFAULT_QUEUE_FILTERS = { status: 'all', range: 30, query: '', page: 1, cursors: [null], sortDir: null };
const DEFAULT_CLIENT_FILTERS = { status: 'all', query: '', page: 1, cursors: [null], sortDir: null };
// The widest range the queue endpoint allows, used when jumping in from the dashboard.
const WIDEST_QUEUE_RANGE = 60;

// Admin portal shell (Figma 87:1625 Dashboard, 87:1921 Queue, 87:2258 Review, 87:2446 Clients,
// 87:2736 Client detail, 87:2886 Messages, 87:3566 Campaigns, 87:3046 Activity log, 87:3224 Settings). Drawn for a 1440px frame and zoomed to fit on desktop.
export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  const { isDesktop, scale, width, height } = useDesignScale();
  // The sign-in response is shown at once; GET /team/me then brings the current name, role and photo.
  const [me, setMe] = useState(null);
  const member = me || user;
  const profile = { name: member?.fullName || 'Team member', role: member?.roleName || '', photo: me?.profilePicture || null };
  const isAdmin = member?.role === 'admin';
  const userId = me?._id || user?.id;
  // Who is reading chat, so own messages can be told apart.
  const viewer = useMemo(
    () => ({ id: userId, isTeam: true, type: isAdmin ? 'admin' : 'staff', name: member?.fullName }),
    [userId, isAdmin, member?.fullName],
  );

  const [route, setRoute] = useState({ view: 'dashboard' });
  const [activeChat, setActiveChat] = useState(null); // { id, name } of the open thread
  const [queueFilters, setQueueFilters] = useState(DEFAULT_QUEUE_FILTERS);
  const [clientFilters, setClientFilters] = useState(DEFAULT_CLIENT_FILTERS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [campaignModal, setCampaignModal] = useState(null); // { mode: 'create' | 'edit' | 'view', id? }
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const unread = useChatUnread();

  useEffect(() => {
    let active = true;
    // A failure keeps the sign-in copy; a 401 signs out through the API layer.
    getTeamMe().then((data) => active && setMe(data), () => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const go = (next) => {
    setRoute(next);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0 });
  };

  // Navigation. Screens pass the row object they show (a document or { id, name, email } client).
  const openDocument = (doc) => go({ view: 'review', id: doc.id, doc, client: doc.client, back: route });
  const openClient = (client) => go({ view: 'client', id: client.id, client, back: route });
  const openQueue = (status) => {
    setQueueFilters({ ...DEFAULT_QUEUE_FILTERS, status, range: WIDEST_QUEUE_RANGE });
    go({ view: 'queue' });
  };
  // Opens the client's thread, even one with no messages yet. Takes a client or just an id.
  const messageClient = (clientOrId) => {
    const client = typeof clientOrId === 'object' ? clientOrId : { id: clientOrId };
    if (!client?.id) return notify('This client could not be found.');
    setActiveChat({ id: client.id, name: client.name || client.fullName });
    go({ view: 'messages' });
  };
  const back = () => go(route.back || { view: 'dashboard' });

  // Actions. The API records status changes in the activity log itself.
  const updateStatus = (doc, status) => notify(`Status updated to ${statusById(status).label}`);

  // Campaigns
  const saveCampaign = (data) => {
    if (data.id) {
      setCampaigns((list) => list.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
      notify('Campaign updated');
    } else {
      setCampaigns((list) => [{ ...data, id: `cp${Date.now()}`, scans: 0, conversions: 0, createdAt: REFERENCE_DATE }, ...list]);
      notify('Campaign created');
    }
    setCampaignModal(null);
  };

  // Which nav item is highlighted for detail screens
  const navFor = (r) => {
    if (r.view === 'review') return r.back?.view === 'client' || r.back?.view === 'clients' ? 'clients' : 'queue';
    if (r.view === 'client') return 'clients';
    return r.view;
  };

  const doc = route.view === 'review' ? route.doc : null;
  const showTopBar = !['review', 'client'].includes(route.view);
  const modalCampaign = campaignModal?.id ? campaigns.find((c) => c.id === campaignModal.id) : null;

  return (
    <div
      className="relative flex bg-[#f5f5f5] font-['Manrope',sans-serif] text-[#111] lg:pl-[20px]"
      style={isDesktop ? { zoom: scale, width, minHeight: height, '--vh': `${height}px` } : { minHeight: '100dvh', '--vh': '100dvh' }}
    >
      <AdminSidebar
        active={navFor(route)}
        badges={{ messages: unread.unreadMessages }}
        onSelect={(id) => go({ view: id })}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onBackToHome={onBackToHome}
      />

      <main className={`flex flex-1 flex-col min-w-0 px-[16px] lg:px-[20px] py-[20px] ${route.view === 'messages' ? 'lg:h-[var(--vh)]' : ''}`}>
        {showTopBar && (
          <div className="mb-[30px] shrink-0">
            <AdminTopBar
              profile={profile}
              showSearch
              onOpenClient={openClient}
              onOpenDocument={openDocument}
              onOpenMenu={() => setMobileNavOpen(true)}
              onLogout={onLogout}
              onBackToHome={onBackToHome}
            />
          </div>
        )}

        {route.view === 'dashboard' && (
          <DashboardView onOpenQueue={openQueue} onViewAllActivity={() => go({ view: 'activity' })} />
        )}

        {route.view === 'queue' && (
          <SubmissionQueueView
            filters={queueFilters}
            onFiltersChange={setQueueFilters}
            onOpenDocument={openDocument}
            onOpenClient={openClient}
            onMessageClient={messageClient}
            onNotify={notify}
            isAdmin={isAdmin}
            currentUserId={userId}
          />
        )}

        {doc && (
          <DocumentReviewView
            key={doc.id || doc._id}
            doc={doc}
            client={route.client}
            onBack={back}
            onStatusChange={updateStatus}
            onMessageClient={messageClient}
            isAdmin={isAdmin}
            currentUserId={userId}
            onNotify={notify}
          />
        )}

        {route.view === 'clients' && (
          <ClientsDirectoryView
            filters={clientFilters}
            onFiltersChange={setClientFilters}
            onOpenClient={openClient}
            onMessageClient={messageClient}
          />
        )}

        {route.view === 'client' && (
          <ClientDetailView
            key={route.id}
            clientId={route.id}
            initialClient={route.client}
            onBack={back}
            onOpenDocument={openDocument}
            onMessageClient={messageClient}
          />
        )}

        {route.view === 'messages' && (
          <MessagesView viewer={viewer} activeClient={activeChat} onSelect={setActiveChat} onOpenClient={openClient} />
        )}

        {route.view === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            referrals={INITIAL_REFERRALS}
            clientsById={CAMPAIGN_CLIENTS_BY_ID}
            onCreate={() => setCampaignModal({ mode: 'create' })}
            onView={(id) => setCampaignModal({ mode: 'view', id })}
            onEdit={(id) => setCampaignModal({ mode: 'edit', id })}
            onNotify={notify}
          />
        )}

        {route.view === 'activity' && <ActivityLogView isAdmin={isAdmin} />}

        {route.view === 'settings' && (
          <SettingsView isAdmin={isAdmin} currentUserId={userId} security={DEFAULT_SECURITY} onNotify={notify} />
        )}
      </main>

      {campaignModal && (
        <CampaignModal
          key={`${campaignModal.mode}-${campaignModal.id || 'new'}`}
          mode={campaignModal.mode}
          campaign={modalCampaign}
          onClose={() => setCampaignModal(null)}
          onSave={saveCampaign}
          onNotify={notify}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
