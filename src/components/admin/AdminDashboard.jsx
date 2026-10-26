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
  ADMIN_PROFILE,
  INITIAL_CLIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_REFERRALS,
  INITIAL_STAFF_ACCOUNTS,
  NOTIFICATION_PREFS,
  DEFAULT_SECURITY,
  REFERENCE_DATE,
  statusById,
} from './adminData';

// `cursors`: see cursorPages.js. The queue's `range` is in days.
const DEFAULT_QUEUE_FILTERS = { status: 'all', range: 30, query: '', page: 1, cursors: [null], sortDir: null };
const DEFAULT_CLIENT_FILTERS = { status: 'all', query: '', page: 1, cursors: [null], sortDir: null };
// The widest range the queue endpoint allows, used when jumping in from the dashboard.
const WIDEST_QUEUE_RANGE = 60;

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Admin portal shell (Figma 87:1625 Dashboard, 87:1921 Queue, 87:2258 Review, 87:2446 Clients,
// 87:2736 Client detail, 87:2886 Messages, 87:3566 Campaigns, 87:3046 Activity log, 87:3224 Settings). Drawn for a 1440px frame and zoomed to fit on desktop.
export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  const { isDesktop, scale, width, height } = useDesignScale();
  const profile = { ...ADMIN_PROFILE, name: user?.fullName || ADMIN_PROFILE.name, role: user?.roleName || ADMIN_PROFILE.role };

  const [route, setRoute] = useState({ view: 'dashboard' });
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  // Dummy documents, only for the conversations' submission ids until chat uses the API.
  const [documents] = useState(INITIAL_DOCUMENTS);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState(INITIAL_CONVERSATIONS[0].clientId);
  const [queueFilters, setQueueFilters] = useState(DEFAULT_QUEUE_FILTERS);
  const [clientFilters, setClientFilters] = useState(DEFAULT_CLIENT_FILTERS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [campaignModal, setCampaignModal] = useState(null); // { mode: 'create' | 'edit' | 'view', id? }
  const [staffAccounts, setStaffAccounts] = useState(INITIAL_STAFF_ACCOUNTS);
  const [notificationPrefs, setNotificationPrefs] = useState(NOTIFICATION_PREFS);
  const [security, setSecurity] = useState(DEFAULT_SECURITY);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const clientsById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients]);

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

  const appendStaffMessage = (clientId, text) => {
    const message = { id: `${clientId}-m${Date.now()}`, from: 'staff', text, time: nowTime(), receipt: 'Delivered' };
    setConversations((list) => {
      const existing = list.find((c) => c.clientId === clientId);
      if (!existing) {
        const doc = documents.find((d) => d.clientId === clientId);
        return [{ clientId, submissionId: doc?.submissionId || '—', updatedAt: `Today, ${nowTime()}`, unread: false, messages: [message] }, ...list];
      }
      return list.map((c) => (c.clientId === clientId ? { ...c, updatedAt: `Today, ${nowTime()}`, messages: [...c.messages, message] } : c));
    });
  };

  // Clients loaded from the API join the local list so the screens still on dummy
  // data (messages, document review) can look them up by id.
  const rememberClient = (client) => {
    if (!client) return;
    setClients((list) => (list.some((c) => c.id === client.id) ? list : [...list, client]));
  };

  // Navigation. API-backed screens pass the row object; dummy screens still pass ids.
  const openDocument = (docOrId) => {
    if (typeof docOrId !== 'object') return go({ view: 'review', id: docOrId, back: route });
    rememberClient(docOrId.client);
    go({ view: 'review', id: docOrId.id, doc: docOrId, client: docOrId.client, back: route });
  };
  const openClient = (clientOrId) => {
    const client = typeof clientOrId === 'object' ? clientOrId : clientsById[clientOrId];
    go({ view: 'client', id: client?.id ?? clientOrId, client, back: route });
  };
  const openQueue = (status) => {
    setQueueFilters({ ...DEFAULT_QUEUE_FILTERS, status, range: WIDEST_QUEUE_RANGE });
    go({ view: 'queue' });
  };
  const messageClient = (clientOrId) => {
    if (typeof clientOrId === 'object') rememberClient(clientOrId);
    const clientId = typeof clientOrId === 'object' ? clientOrId.id : clientOrId;
    if (!conversations.some((c) => c.clientId === clientId)) {
      const doc = documents.find((d) => d.clientId === clientId);
      setConversations((list) => [{ clientId, submissionId: doc?.submissionId || '—', updatedAt: 'New', unread: false, messages: [] }, ...list]);
    }
    selectChat(clientId);
    go({ view: 'messages' });
  };
  const back = () => go(route.back || { view: 'dashboard' });

  // Actions. The API records status changes in the activity log itself.
  const updateStatus = (doc, status) => notify(`Status updated to ${statusById(status).label}`);

  const sendMessage = (clientId, text) => appendStaffMessage(clientId, text);

  function selectChat(clientId) {
    setActiveChat(clientId);
    setConversations((list) => list.map((c) => (c.clientId === clientId ? { ...c, unread: false } : c)));
  }

  const markUnread = (clientId) => {
    setConversations((list) => list.map((c) => (c.clientId === clientId ? { ...c, unread: true } : c)));
    notify('Marked as unread');
  };


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

  // Settings
  const addStaff = (member) => {
    setStaffAccounts((list) => [...list, { ...member, id: `s${Date.now()}`, createdAt: REFERENCE_DATE }]);
    notify(`${member.name} added — an invite was sent to ${member.email}`);
  };

  const updateStaff = (id, patch) => {
    const member = staffAccounts.find((s) => s.id === id);
    if (patch.role === 'Staff' && staffAccounts.filter((s) => s.role === 'Admin').length === 1) {
      notify('At least one admin is required');
      return;
    }
    setStaffAccounts((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    if (patch.role) notify(`${member.name} is now ${patch.role === 'Admin' ? 'an Admin' : 'Staff'}`);
  };

  const removeStaff = (id) => {
    const member = staffAccounts.find((s) => s.id === id);
    if (member.role === 'Admin' && staffAccounts.filter((s) => s.role === 'Admin').length === 1) {
      notify('At least one admin is required');
      return;
    }
    setStaffAccounts((list) => list.filter((s) => s.id !== id));
    notify(`${member.name} removed`);
  };

  const toggleNotification = (id, enabled) => setNotificationPrefs((list) => list.map((p) => (p.id === id ? { ...p, enabled } : p)));

  const saveSecurity = (next) => {
    setSecurity(next);
    notify('Security settings saved');
  };

  // Which nav item is highlighted for detail screens
  const navFor = (r) => {
    if (r.view === 'review') return r.back?.view === 'client' || r.back?.view === 'clients' ? 'clients' : 'queue';
    if (r.view === 'client') return 'clients';
    return r.view;
  };

  const doc = route.view === 'review' ? route.doc || documents.find((d) => d.id === route.id) : null;
  const showTopBar = !['review', 'client'].includes(route.view);
  const modalCampaign = campaignModal?.id ? campaigns.find((c) => c.id === campaignModal.id) : null;

  return (
    <div
      className="relative flex bg-[#f5f5f5] font-['Manrope',sans-serif] text-[#111] lg:pl-[20px]"
      style={isDesktop ? { zoom: scale, width, minHeight: height, '--vh': `${height}px` } : { minHeight: '100dvh', '--vh': '100dvh' }}
    >
      <AdminSidebar
        active={navFor(route)}
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
              showSearch={['dashboard', 'campaigns', 'settings'].includes(route.view)}
              onSearch={(query) => {
                setDashboardSearch(query);
                go({ view: 'dashboard' });
              }}
              onOpenMenu={() => setMobileNavOpen(true)}
              onLogout={onLogout}
              onBackToHome={onBackToHome}
            />
          </div>
        )}

        {route.view === 'dashboard' && (
          <DashboardView
            search={dashboardSearch}
            onClearSearch={() => setDashboardSearch('')}
            onOpenQueue={openQueue}
            onViewAllActivity={() => go({ view: 'activity' })}
            onOpenClient={openClient}
            onOpenDocument={openDocument}
          />
        )}

        {route.view === 'queue' && (
          <SubmissionQueueView
            filters={queueFilters}
            onFiltersChange={setQueueFilters}
            onOpenDocument={openDocument}
            onOpenClient={openClient}
            onMessageClient={messageClient}
            onNotify={notify}
            isAdmin={user?.role === 'admin'}
            currentUserId={user?.id}
          />
        )}

        {doc && (
          <DocumentReviewView
            key={doc.id || doc._id}
            doc={doc}
            client={route.client || clientsById[doc.clientId]}
            onBack={back}
            onStatusChange={updateStatus}
            onMessageClient={messageClient}
            isAdmin={user?.role === 'admin'}
            currentUserId={user?.id}
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
          <MessagesView
            conversations={conversations}
            clientsById={clientsById}
            activeClientId={activeChat}
            onSelect={selectChat}
            onSend={sendMessage}
            onOpenClient={openClient}
            onMarkUnread={markUnread}
          />
        )}

        {route.view === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            referrals={INITIAL_REFERRALS}
            clientsById={clientsById}
            onCreate={() => setCampaignModal({ mode: 'create' })}
            onView={(id) => setCampaignModal({ mode: 'view', id })}
            onEdit={(id) => setCampaignModal({ mode: 'edit', id })}
            onNotify={notify}
          />
        )}

        {route.view === 'activity' && <ActivityLogView isAdmin={user?.role === 'admin'} />}

        {route.view === 'settings' && (
          <SettingsView
            staffAccounts={staffAccounts}
            notificationPrefs={notificationPrefs}
            security={security}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onRemoveStaff={removeStaff}
            onToggleNotification={toggleNotification}
            onSaveSecurity={saveSecurity}
          />
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
