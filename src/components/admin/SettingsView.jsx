import { useState } from 'react';
import { Icon, Avatar, PageHeader, Toggle, SelectField, Popover, Pagination, ListState, primaryButton, secondaryButton } from './ui';
import AddStaffModal from './AddStaffModal';
import { formatDate, SESSION_TIMEOUTS, PASSWORD_POLICIES } from './adminData';
import { localDay } from './adminApiMappers';
import {
  listTeam,
  createTeamMember,
  updateTeamMember,
  deactivateTeamMember,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/team';
import useApiQuery from '../../hooks/useApiQuery';

const A = '/figma/admin';

const TABS = [
  { id: 'staff', label: 'Staff Accounts', icon: `${A}/user-gear.svg` },
  { id: 'notifications', label: 'Notifications', icon: `${A}/bell-20.svg` },
  { id: 'security', label: 'Security', icon: `${A}/shield.svg` },
];

const STAFF_COLUMNS = 'grid-cols-[320px_minmax(200px,1fr)_260px_200px_80px]';
const tableHeader = 'bg-[#f5f5f5] border-[#e8e8e8] border-b border-solid flex h-[40px] items-center font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';
const cellText = 'font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap';

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap gap-[10px] items-start p-[16px] w-full">
      <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-[200px]">
        <p className="font-bold text-[16px] text-[#111]">{title}</p>
        <p className="font-normal text-[14px] text-[#444]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex gap-[16px] items-center justify-between w-full">
      <div className="flex flex-col gap-[6px] items-start justify-center leading-[normal] min-w-0">
        <p className="font-medium text-[14px] text-[#111]">{label}</p>
        <p className="font-normal text-[12px] text-[#6a6a6a]">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

const STATUS_PILL = 'inline-flex items-center px-[8px] py-[3px] rounded-[100px] text-[12px] font-semibold';
const PAGE_LIMIT = 20;

// Staff Accounts tab (Node 87:3291). Admin only: lists, adds, edits, deactivates and
// reactivates team members. Roles can't be changed here: the API creates staff only.
function StaffAccounts({ currentUserId, onNotify }) {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { mode: 'add' } | { mode: 'edit', member }
  const [busyId, setBusyId] = useState(null);
  const { data, loading, error, reload } = useApiQuery(`team-list:${page}`, () => listTeam({ page, limit: PAGE_LIMIT }));
  const members = data?.data || [];
  const pageCount = Math.max(1, data?.pagination?.totalPages || 1);

  const setActive = async (member, isActive) => {
    setBusyId(member._id);
    try {
      if (isActive) await updateTeamMember(member._id, { isActive: true });
      else await deactivateTeamMember(member._id);
      onNotify(isActive ? `${member.fullName} reactivated` : `${member.fullName} deactivated and signed out`);
      reload();
    } catch (err) {
      onNotify(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // Errors are thrown back to the modal, which shows them.
  const save = async (values) => {
    if (modal.mode === 'add') {
      const created = await createTeamMember(values);
      onNotify(`${created.fullName} added. They can sign in with their email.`);
      setPage(1);
    } else {
      await updateTeamMember(modal.member._id, { fullName: values.fullName, roleName: values.roleName });
      onNotify('Staff member updated');
    }
    setModal(null);
    reload();
  };

  return (
    <div className="bg-white flex flex-col items-start overflow-clip rounded-[20px] w-full" data-node-id="87:3291">
      <CardHeader
        title="Staff Accounts"
        subtitle="Team members who can sign in to the staff portal"
        action={
          <button type="button" onClick={() => setModal({ mode: 'add' })} className={primaryButton}>
            <Icon src={`${A}/plus-white.svg`} size={20} />
            Add staff
          </button>
        }
      />
      <div className="overflow-x-auto w-full">
        <div className="min-w-[1060px]" role="table" aria-label="Staff accounts" aria-busy={loading}>
          <div role="row" className={`grid ${STAFF_COLUMNS}`}>
            <div role="columnheader" className={`${tableHeader} px-[10px]`}>staff</div>
            <div role="columnheader" className={`${tableHeader} px-[10px]`}>mail</div>
            <div role="columnheader" className={`${tableHeader} px-[10px]`}>role</div>
            <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>Date created</div>
            <div role="columnheader" className={tableHeader} />
          </div>
          {!error && members.map((m) => {
            const isSelf = String(m._id) === String(currentUserId);
            const isAdminMember = m.role === 'admin';
            const items = [
              { key: 'edit', label: 'Edit name & role name', onSelect: () => setModal({ mode: 'edit', member: { ...m, name: m.fullName } }) },
            ];
            // Admins and your own account can't be deactivated from here.
            if (!isSelf && !isAdminMember) {
              items.push(
                m.isActive
                  ? { key: 'deactivate', label: 'Deactivate member', danger: true, onSelect: () => setActive(m, false) }
                  : { key: 'reactivate', label: 'Reactivate member', onSelect: () => setActive(m, true) },
              );
            }
            return (
              <div key={m._id} role="row" className={`grid ${STAFF_COLUMNS} h-[90px] border-[#e8e8e8] border-b border-solid ${m.isActive ? '' : 'opacity-60'}`}>
                <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                  <Avatar name={m.fullName} photo={m.profilePicture} textClassName="font-['Geist',sans-serif]" />
                  <p className="font-medium leading-[24px] overflow-hidden text-[14px] text-[#111] text-ellipsis whitespace-nowrap">
                    {m.fullName}{isSelf ? ' (you)' : ''}
                  </p>
                </div>
                <div role="cell" className={`flex items-center min-w-0 px-[10px] ${cellText}`}><span className="truncate">{m.email}</span></div>
                <div role="cell" className={`flex gap-[6px] items-center px-[10px] ${cellText}`}>
                  {m.roleName}
                  {isAdminMember && <span className={`${STATUS_PILL} bg-[rgba(0,148,197,0.1)] text-[#0094c5]`}>Admin</span>}
                  {!m.isActive && <span className={`${STATUS_PILL} bg-[#f5f5f5] text-[#6a6a6a]`}>Deactivated</span>}
                </div>
                <div role="cell" className={`flex items-center px-[16px] ${cellText}`}>{m.createdAt ? formatDate(localDay(m.createdAt)) : '—'}</div>
                <div role="cell" className="flex items-center justify-center px-[10px]">
                  <Popover
                    align="right"
                    items={items}
                    trigger={({ toggle }) => (
                      <button
                        type="button"
                        onClick={toggle}
                        disabled={busyId === m._id}
                        aria-label={`Actions for ${m.fullName}`}
                        className="flex items-center justify-center rounded-[100px] size-[36px] cursor-pointer hover:bg-[#f5f5f5] disabled:opacity-40"
                      >
                        <Icon src={`${A}/dots-three.svg`} />
                      </button>
                    )}
                  />
                </div>
              </div>
            );
          })}
          {(error || loading || members.length === 0) && (
            <ListState loading={loading} error={error} onRetry={reload} empty="No team members yet." />
          )}
        </div>
      </div>
      {pageCount > 1 && (
        <div className="flex justify-end p-[16px] w-full">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      )}
      {modal && (
        <AddStaffModal member={modal.mode === 'edit' ? modal.member : null} onClose={() => setModal(null)} onSubmit={save} />
      )}
    </div>
  );
}

const NOTIFICATION_PREFS = [
  { key: 'newSubmissionReceived', label: 'New Submission Received', description: 'Get notified when a client uploads new documents' },
  { key: 'reUploadCompleted', label: 'Re-Upload Completed', description: 'Notify when a client re-uploads a requested document' },
  { key: 'newClientMessage', label: 'New Client Message', description: 'Receive alerts for incoming chat messages' },
  { key: 'irsAcceptanceNotification', label: 'IRS Acceptance Notification', description: 'Alert when IRS accepts a filed return' },
  { key: 'dailySummaryEmail', label: 'Daily Summary Email', description: 'Receive a daily digest of activity at 8:00 AM' },
];

// Notifications tab (Node 87:3531). Each switch saves at once; a failed save puts it back.
function Notifications({ onNotify }) {
  const { data, loading, error, reload } = useApiQuery('notification-preferences', getNotificationPreferences);
  const [saved, setSaved] = useState(null); // the server's latest copy after a save
  const [pending, setPending] = useState({}); // key -> value while its save runs

  const prefs = saved || data;

  const toggle = async (key, value) => {
    setPending((p) => ({ ...p, [key]: value }));
    try {
      setSaved(await updateNotificationPreferences({ [key]: value }));
    } catch (err) {
      onNotify(`Couldn't save that change: ${err.message}`);
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div className="bg-white flex flex-col items-start rounded-[20px] w-full lg:w-[600px]" data-node-id="87:3531">
      <CardHeader title="Notification Preferences" subtitle="Choose which events trigger email and push notifications" />
      {!prefs ? (
        <ListState className="py-[30px] w-full" loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-[20px] items-start pb-[16px] px-[16px] w-full">
          {NOTIFICATION_PREFS.map((p) => (
            <ToggleRow
              key={p.key}
              label={p.label}
              description={p.description}
              checked={Boolean(p.key in pending ? pending[p.key] : prefs[p.key])}
              onChange={(on) => toggle(p.key, on)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Security tab (Node 87:3429). The API has no security settings yet, so nothing here is saved.
function Security({ saved }) {
  const [draft, setDraft] = useState(saved);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="bg-white flex flex-col gap-[40px] items-start pb-[16px] rounded-[20px] w-full lg:w-[600px]" data-node-id="87:3429">
      <div className="flex flex-col gap-[10px] items-start w-full">
        <CardHeader title="Security" subtitle="Session management and authentication settings" />
        <p className="mx-[16px] text-[13px] font-medium text-[#b54708] bg-[#fffaeb] border border-[#fedf89] rounded-[12px] px-[12px] py-[8px]">
          Not connected yet: the server has no security settings, so changes here can't be saved.
        </p>
        <div className="flex flex-col gap-[20px] items-start w-full">
          <div className="px-[16px] w-full">
            <ToggleRow label="Two-Factor Authentication" description="Require 2FA for all staff logins" checked={draft.twoFactor} onChange={(on) => set({ twoFactor: on })} />
          </div>
          <div className="h-0 relative w-full">
            <div className="absolute inset-[-0.5px_0]">
              <img alt="" className="block max-w-none size-full" src={`${A}/divider-line.svg`} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-[20px] items-start px-[16px] w-full">
            <SelectField id="session-timeout" label="Session Timeout" value={draft.sessionTimeout} options={SESSION_TIMEOUTS} onChange={(v) => set({ sessionTimeout: v })} />
            <SelectField id="password-policy" label="Password Policy" value={draft.passwordPolicy} options={PASSWORD_POLICIES} onChange={(v) => set({ passwordPolicy: v })} />
          </div>
          <div className="px-[16px] w-full">
            <ToggleRow label="IP Allowlisting" description="Restrict portal access to specific IP addresses" checked={draft.ipAllowlist} onChange={(on) => set({ ipAllowlist: on })} />
          </div>
        </div>
      </div>
      <div className="flex gap-[10px] items-center justify-end px-[16px] w-full">
        <button type="button" onClick={() => setDraft(saved)} className={secondaryButton}>Reset</button>
        <button type="button" disabled className={primaryButton}>Save changes</button>
      </div>
    </div>
  );
}

// Settings (Nodes 87:3224, 87:3464, 87:3362)
// Staff accounts are admin only; staff see their own notification preferences and security.
export default function SettingsView({ isAdmin, currentUserId, security, onNotify }) {
  const tabs = isAdmin ? TABS : TABS.filter((t) => t.id !== 'staff');
  const [tab, setTab] = useState(tabs[0].id);

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:3275">
      <PageHeader title="Settings" subtitle="Portal configuration, staff accounts, and preferences" />
      <div className="flex flex-col gap-[10px] items-start w-full">
        <div role="tablist" aria-label="Settings sections" className="bg-[#e8e8e8] flex flex-wrap items-center justify-center overflow-clip p-[2px] rounded-[30px] shrink-0">
          {tabs.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex gap-[8px] items-center justify-center min-w-[60px] px-[20px] py-[8px] rounded-[20px] shrink-0 cursor-pointer transition-colors ${active ? 'bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)]' : 'hover:bg-white/50'}`}
              >
                <Icon src={t.icon} size={20} />
                <span className={`leading-[24px] text-[14px] text-[#111] text-center whitespace-nowrap ${active ? 'font-semibold' : 'font-normal'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'staff' && isAdmin && <StaffAccounts currentUserId={currentUserId} onNotify={onNotify} />}
        {tab === 'notifications' && <Notifications onNotify={onNotify} />}
        {tab === 'security' && <Security saved={security} />}
      </div>
    </div>
  );
}
