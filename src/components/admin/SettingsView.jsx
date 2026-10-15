import { useState } from 'react';
import { Icon, Avatar, PageHeader, Toggle, SelectField, Popover, primaryButton, secondaryButton } from './ui';
import AddStaffModal from './AddStaffModal';
import { formatDate, SESSION_TIMEOUTS, PASSWORD_POLICIES } from './adminData';

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

// Staff Accounts tab (Node 87:3291)
function StaffAccounts({ accounts, onAdd, onUpdate, onRemove }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="bg-white flex flex-col items-start overflow-clip rounded-[20px] w-full" data-node-id="87:3291">
      <CardHeader
        title="Staff Accounts"
        subtitle="Portal configuration, staff accounts, and preferences"
        action={
          <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
            <Icon src={`${A}/plus-white.svg`} size={20} />
            Add staff
          </button>
        }
      />
      <div className="overflow-x-auto w-full">
        <div className="min-w-[1060px]" role="table" aria-label="Staff accounts">
          <div role="row" className={`grid ${STAFF_COLUMNS}`}>
            <div role="columnheader" className={`${tableHeader} px-[10px]`}>staff</div>
            <div role="columnheader" className={`${tableHeader} px-[10px]`}>mail</div>
            <div role="columnheader" className={`${tableHeader} px-[10px]`}>role</div>
            <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>Date created</div>
            <div role="columnheader" className={tableHeader} />
          </div>
          {accounts.map((s) => (
            <div key={s.id} role="row" className={`grid ${STAFF_COLUMNS} h-[90px] border-[#e8e8e8] border-b border-solid`}>
              <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                <Avatar name={s.name} photo={s.photo} textClassName="font-['Geist',sans-serif]" />
                <p className="font-medium leading-[24px] overflow-hidden text-[14px] text-[#111] text-ellipsis whitespace-nowrap">{s.name}</p>
              </div>
              <div role="cell" className={`flex items-center min-w-0 px-[10px] ${cellText}`}><span className="truncate">{s.email}</span></div>
              <div role="cell" className={`flex items-center px-[10px] ${cellText}`}>{s.role}</div>
              <div role="cell" className={`flex items-center px-[16px] ${cellText}`}>{formatDate(s.createdAt)}</div>
              <div role="cell" className="flex items-center justify-center px-[10px]">
                <Popover
                  align="right"
                  items={[
                    { key: 'role', label: s.role === 'Admin' ? 'Change role to Staff' : 'Change role to Admin', onSelect: () => onUpdate(s.id, { role: s.role === 'Admin' ? 'Staff' : 'Admin' }) },
                    { key: 'remove', label: 'Remove member', danger: true, onSelect: () => onRemove(s.id) },
                  ]}
                  trigger={({ toggle }) => (
                    <button type="button" onClick={toggle} aria-label={`Actions for ${s.name}`} className="flex items-center justify-center rounded-[100px] size-[36px] cursor-pointer hover:bg-[#f5f5f5]">
                      <Icon src={`${A}/dots-three.svg`} />
                    </button>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {adding && (
        <AddStaffModal
          existingEmails={accounts.map((s) => s.email.toLowerCase())}
          onClose={() => setAdding(false)}
          onAdd={(member) => {
            onAdd(member);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

// Notifications tab (Node 87:3531)
function Notifications({ prefs, onToggle }) {
  return (
    <div className="bg-white flex flex-col items-start rounded-[20px] w-full lg:w-[600px]" data-node-id="87:3531">
      <CardHeader title="Notification Preferences" subtitle="Choose which events trigger email and push notifications" />
      <div className="flex flex-col gap-[20px] items-start pb-[16px] px-[16px] w-full">
        {prefs.map((p) => (
          <ToggleRow key={p.id} label={p.label} description={p.description} checked={p.enabled} onChange={(on) => onToggle(p.id, on)} />
        ))}
      </div>
    </div>
  );
}

// Security tab (Node 87:3429)
function Security({ saved, onSave }) {
  const [draft, setDraft] = useState(saved);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="bg-white flex flex-col gap-[40px] items-start pb-[16px] rounded-[20px] w-full lg:w-[600px]" data-node-id="87:3429">
      <div className="flex flex-col gap-[10px] items-start w-full">
        <CardHeader title="Security" subtitle="Session management and authentication settings" />
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
        <button type="button" onClick={() => onSave(draft)} className={primaryButton}>Save changes</button>
      </div>
    </div>
  );
}

// Settings (Nodes 87:3224, 87:3464, 87:3362)
export default function SettingsView({ staffAccounts, notificationPrefs, security, onAddStaff, onUpdateStaff, onRemoveStaff, onToggleNotification, onSaveSecurity }) {
  const [tab, setTab] = useState('staff');

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:3275">
      <PageHeader title="Settings" subtitle="Portal configuration, staff accounts, and preferences" />
      <div className="flex flex-col gap-[10px] items-start w-full">
        <div role="tablist" aria-label="Settings sections" className="bg-[#e8e8e8] flex flex-wrap items-center justify-center overflow-clip p-[2px] rounded-[30px] shrink-0">
          {TABS.map((t) => {
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

        {tab === 'staff' && <StaffAccounts accounts={staffAccounts} onAdd={onAddStaff} onUpdate={onUpdateStaff} onRemove={onRemoveStaff} />}
        {tab === 'notifications' && <Notifications prefs={notificationPrefs} onToggle={onToggleNotification} />}
        {tab === 'security' && <Security key={JSON.stringify(security)} saved={security} onSave={onSaveSecurity} />}
      </div>
    </div>
  );
}
