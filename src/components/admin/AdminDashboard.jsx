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
  INITIAL_ACTIVITY,
  INITIAL_CONVERSATIONS,
  QUICK_REPLIES,
  INITIAL_CAMPAIGNS,
  INITIAL_REFERRALS,
  INITIAL_STAFF_ACCOUNTS,
  NOTIFICATION_PREFS,
  DEFAULT_SECURITY,
  REFERENCE_DATE,
  statusById,
} from './adminData';

const DEFAULT_QUEUE_FILTERS = { status: 'all', range: '30', query: '', page: 1, sortDir: null };
const DEFAULT_CLIENT_FILTERS = { status: 'all', query: '', page: 1, sortDir: null };

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const shortName = (name) => {
  const [first, ...rest] = name.split(' ');
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

// Admin portal shell (Figma 87:1625 Dashboard, 87:1921 Queue, 87:2258 Review, 87:2446 Clients,
// 87:2736 Client detail, 87:2886 Messages, 87:3566 Campaigns, 87:3046 Activity log, 87:3224 Settings). Drawn for a 1440px frame and zoomed to fit on desktop.
export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  const { isDesktop, scale, width, height } = useDesignScale();
  const profile = { ...ADMIN_PROFILE, name: user?.fullName || ADMIN_PROFILE.name, role: user?.roleName || ADMIN_PROFILE.role };

  const [route, setRoute] = useState({ view: 'dashboard' });
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
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

  const logActivity = (kind, action, target) =>
    setActivity((list) => [{ id: `a${Date.now()}`, kind, actor: shortName(profile.name), action, target, time: 'Just now' }, ...list]);

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

  const setDocStatus = (doc, status) => {
    setDocuments((list) => list.map((d) => (d.id === doc.id ? { ...d, status } : d)));
    setClients((list) => list.map((c) => (c.id === doc.clientId ? { ...c, status } : c)));
  };

  // Navigation
  const openDocument = (id) => go({ view: 'review', id, back: route });
  const openClient = (id) => go({ view: 'client', id, back: route });
  const openQueue = (status) => {
    setQueueFilters({ ...DEFAULT_QUEUE_FILTERS, status, range: 'all' });
    go({ view: 'queue' });
  };
  const messageClient = (clientId) => {
    if (!conversations.some((c) => c.clientId === clientId)) {
      const doc = documents.find((d) => d.clientId === clientId);
      setConversations((list) => [{ clientId, submissionId: doc?.submissionId || '—', updatedAt: 'New', unread: false, messages: [] }, ...list]);
    }
    selectChat(clientId);
    go({ view: 'messages' });
  };
  const back = () => go(route.back || { view: 'dashboard' });

  // Actions
  const updateStatus = (doc, status) => {
    const client = clientsById[doc.clientId];
    setDocStatus(doc, status);
    logActivity(status === 'filed' ? 'filed' : 'status', `Updated status to ${statusById(status).label} for`, `${client.name} (${doc.submissionId})`);
    notify(`Status updated to ${statusById(status).label}`);
  };

  const requestReupload = (doc) => {
    const client = clientsById[doc.clientId];
    setDocStatus(doc, 'action_needed');
    appendStaffMessage(client.id, QUICK_REPLIES[1].text);
    logActivity('reupload', 'Requested re-upload from', `${client.name} (${doc.submissionId}) — ${doc.type}`);
    notify(`Re-upload requested from ${client.name}`);
  };

  const confirmFields = (doc) => {
    const client = clientsById[doc.clientId];
    logActivity('verified', 'Verified OCR fields of', `${client.name} (${doc.submissionId})`);
    notify('All fields confirmed');
  };

  const sendMessage = (clientId, text) => {
    appendStaffMessage(clientId, text);
    const conversation = conversations.find((c) => c.clientId === clientId);
    logActivity('message', 'Sent message to', `${clientsById[clientId].name} (${conversation?.submissionId || '—'})`);
  };

  function selectChat(clientId) {
    setActiveChat(clientId);
    setConversations((list) => list.map((c) => (c.clientId === clientId ? { ...c, unread: false } : c)));
  }

  const markUnread = (clientId) => {
    setConversations((list) => list.map((c) => (c.clientId === clientId ? { ...c, unread: true } : c)));
    notify('Marked as unread');
  };

  const updateNotes = (clientId, notes) => setClients((list) => list.map((c) => (c.id === clientId ? { ...c, notes } : c)));

  // Campaigns
  const saveCampaign = (data) => {
    if (data.id) {
      setCampaigns((list) => list.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
      logActivity('filed', 'Updated campaign', data.title);
      notify('Campaign updated');
    } else {
      setCampaigns((list) => [{ ...data, id: `cp${Date.now()}`, scans: 0, conversions: 0, createdAt: REFERENCE_DATE }, ...list]);
      logActivity('filed', 'Created campaign', data.title);
      notify('Campaign created');
    }
    setCampaignModal(null);
  };

  // Settings
  const addStaff = (member) => {
    setStaffAccounts((list) => [...list, { ...member, id: `s${Date.now()}`, createdAt: REFERENCE_DATE }]);
    logActivity('filed', 'Added staff member', `${member.name} (${member.role})`);
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
    logActivity('filed', 'Removed staff member', member.name);
    notify(`${member.name} removed`);
  };

  const toggleNotification = (id, enabled) => setNotificationPrefs((list) => list.map((p) => (p.id === id ? { ...p, enabled } : p)));

  const saveSecurity = (next) => {
    setSecurity(next);
    logActivity('filed', 'Updated security settings for', 'Staff Portal');
    notify('Security settings saved');
  };

  // Which nav item is highlighted for detail screens
  const navFor = (r) => {
    if (r.view === 'review') return r.back?.view === 'client' || r.back?.view === 'clients' ? 'clients' : 'queue';
    if (r.view === 'client') return 'clients';
    return r.view;
  };

  const doc = route.view === 'review' ? documents.find((d) => d.id === route.id) : null;
  const client = route.view === 'client' ? clientsById[route.id] : null;
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
                setQueueFilters({ ...DEFAULT_QUEUE_FILTERS, query, range: 'all' });
                go({ view: 'queue' });
              }}
              onOpenMenu={() => setMobileNavOpen(true)}
              onLogout={onLogout}
              onBackToHome={onBackToHome}
            />
          </div>
        )}

        {route.view === 'dashboard' && (
          <DashboardView documents={documents} activity={activity} onOpenQueue={openQueue} onViewAllActivity={() => go({ view: 'activity' })} />
        )}

        {route.view === 'queue' && (
          <SubmissionQueueView
            documents={documents}
            clientsById={clientsById}
            filters={queueFilters}
            onFiltersChange={setQueueFilters}
            onOpenDocument={openDocument}
            onOpenClient={openClient}
            onMessageClient={messageClient}
          />
        )}

        {doc && (
          <DocumentReviewView
            key={doc.id}
            doc={doc}
            client={clientsById[doc.clientId]}
            onBack={back}
            onStatusChange={updateStatus}
            onRequestReupload={requestReupload}
            onMessageClient={messageClient}
            onFieldsConfirmed={confirmFields}
          />
        )}

        {route.view === 'clients' && (
          <ClientsDirectoryView
            clients={clients}
            documents={documents}
            filters={clientFilters}
            onFiltersChange={setClientFilters}
            onOpenClient={openClient}
            onMessageClient={messageClient}
          />
        )}

        {client && (
          <ClientDetailView
            client={client}
            documents={documents}
            onBack={back}
            onOpenDocument={openDocument}
            onMessageClient={messageClient}
            onNotesChange={updateNotes}
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

        {route.view === 'activity' && <ActivityLogView activity={activity} />}

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
