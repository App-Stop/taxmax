import { useRef, useState } from 'react';
import { updateCustomerProfile, removeCustomerProfilePicture } from '../../services/auth';
import { uploadProfilePicture, PROFILE_PICTURE_TYPES } from '../../services/profile';

const imgSignOut = "/figma/dashboard/sign-out.svg";

const EMPTY = '—';

const maskSsn = (ssn) => {
  const last4 = (ssn || '').replace(/\D/g, '').slice(-4);
  return last4 ? `***-**-${last4}` : EMPTY;
};

// The API stores E.164 (+16122132314); US numbers read as (612) 213-2314.
const formatPhone = (phone) => {
  if (!phone) return EMPTY;
  const us = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return us ? `(${us[1]}) ${us[2]}-${us[3]}` : phone;
};

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-[16px] items-center justify-between p-[16px] shrink-0 w-full">
      <p className="font-normal leading-[normal] text-[14px] text-[#444] whitespace-nowrap">{label}</p>
      <p className="font-semibold leading-[normal] text-[14px] text-[#111] text-right">{value}</p>
    </div>
  );
}

// Profile (Node 71:2377)
export default function ProfileView({ user, onUserUpdated, onLogout }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ssn: '', phoneNumber: '', maritalStatus: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [failedPhoto, setFailedPhoto] = useState(null);
  const fileInput = useRef(null);
  const initials = (user?.fullName || user?.email || 'User').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const startEditing = () => {
    setDraft({ ssn: '', phoneNumber: user?.phone || '', maritalStatus: user?.status?.toLowerCase() || '' });
    setError('');
    setMessage('');
    setEditing(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const changes = {};
    const ssn = draft.ssn.replace(/[\s-]/g, '');
    if (ssn && !/^\d{9}$/.test(ssn)) {
      setError('Social Security Number must contain 9 digits.');
      return;
    }
    if (ssn) changes.ssn = ssn;
    if (draft.phoneNumber.trim() !== (user?.phone || '')) changes.phoneNumber = draft.phoneNumber.trim();
    if (draft.maritalStatus !== (user?.status?.toLowerCase() || '')) changes.maritalStatus = draft.maritalStatus;
    if (!Object.keys(changes).length) {
      setError('');
      setEditing(false);
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      onUserUpdated(await updateCustomerProfile(changes));
      setDraft({ ssn: '', phoneNumber: '', maritalStatus: '' });
      setEditing(false);
      setMessage('Personal information saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePhoto = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      onUserUpdated(await uploadProfilePicture(file));
      setMessage('Profile photo updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      onUserUpdated(await removeCustomerProfilePicture());
      setMessage('Profile photo removed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full rounded-[12px] border border-[#dcdcdc] bg-white px-[12px] py-[10px] text-[14px] text-[#111] focus:outline-[#0094c5]';

  return (
    <div className="flex justify-center px-[16px] lg:pl-0 lg:pr-[60px] pt-[8px] lg:pt-[80px] pb-[60px] lg:pb-[80px]">
      <div className="bg-[rgba(255,255,255,0.6)] border border-[#f5f5f5] border-solid flex flex-col items-center overflow-clip rounded-[20px] shadow-[0px_0px_60px_0px_rgba(0,101,131,0.1)] w-full max-w-[664px] lg:w-[664px]" data-node-id="71:2377">
        <div className="flex flex-col gap-[16px] items-center px-[24px] py-[40px] shrink-0 w-full" data-node-id="71:2378">
          <div className="flex flex-col gap-[10px] items-center shrink-0 max-w-full">
            <div className="flex size-[88px] items-center justify-center overflow-hidden rounded-full bg-[#e4f4f9] text-[28px] font-semibold text-[#006583]" role="img" aria-label={`${user?.fullName || 'User'} profile photo`}>
              {user?.profilePicture && failedPhoto !== user.profilePicture ? (
                <img src={user.profilePicture} alt="" onError={() => setFailedPhoto(user.profilePicture)} className="size-full object-cover" />
              ) : initials}
            </div>
            <input ref={fileInput} type="file" accept={PROFILE_PICTURE_TYPES.join(',')} aria-label="Upload profile photo" disabled={busy || editing} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; changePhoto(file); }} />
            <div className="flex flex-wrap justify-center gap-[16px] text-[14px]">
              <button type="button" disabled={busy || editing} onClick={() => fileInput.current?.click()} className="cursor-pointer font-semibold text-[#0094c5] disabled:opacity-50">{user?.profilePicture ? 'Change photo' : 'Upload photo'}</button>
              {user?.profilePicture && <button type="button" disabled={busy || editing} onClick={removePhoto} className="cursor-pointer text-[#b42318] disabled:opacity-50">Remove photo</button>}
            </div>
            <p className="text-[12px] text-[#6a6a6a]">Images up to 30 MB</p>
            <div className="flex flex-col gap-[4px] items-center leading-[normal] text-center max-w-full">
              <p className="font-bold text-[20px] text-[#111]">{user?.fullName}</p>
              <p className="font-normal text-[14px] text-[#444] [word-break:break-word]">{user?.email}</p>
            </div>
            {/* The API has no taxpayer ID yet; only locally created accounts carry one. */}
            {user?.filingId && (
              <div className="bg-[#f5f5f5] border border-[#e8e8e8] border-solid flex items-start px-[10px] py-[4px] rounded-[100px] shrink-0">
                <p className="font-medium leading-[normal] text-[10px] text-[#6a6a6a] text-center tracking-[0.1px] whitespace-nowrap">
                  Taxpayer ID: {user.filingId}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[24px] items-start p-[20px] sm:p-[40px] shrink-0 w-full" data-node-id="71:2387">
          {busy && <p role="status" className="text-[14px] text-[#444]">Saving changes…</p>}
          {error && <p role="alert" className="text-[14px] text-[#b42318]">{error}</p>}
          {message && <p role="status" className="text-[14px] text-[#067647]">{message}</p>}
          <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="71:2388">
            <div className="flex w-full items-center justify-between gap-[12px]">
              <p className="font-semibold leading-[normal] text-[16px] text-[#111]">Personal Information</p>
              {!editing && <button type="button" disabled={busy} onClick={startEditing} className="cursor-pointer text-[14px] font-semibold text-[#0094c5] disabled:opacity-50">Edit</button>}
            </div>
            {editing ? (
              <form onSubmit={save} className="flex w-full flex-col gap-[16px] rounded-[20px] border border-[#e8e8e8] bg-white p-[16px]">
                <fieldset disabled={busy} className="flex min-w-0 flex-col gap-[16px] disabled:opacity-60">
                  <div className="flex flex-col gap-[6px] text-[14px] text-[#444]">
                    <label htmlFor="profile-ssn">Social Security Number</label>
                    <input id="profile-ssn" type="password" inputMode="numeric" autoComplete="off" aria-describedby="profile-ssn-hint" value={draft.ssn} onChange={(event) => setDraft({ ...draft, ssn: event.target.value })} placeholder={user?.ssn ? maskSsn(user.ssn) : 'Enter 9 digits'} className={inputClass} />
                    <span id="profile-ssn-hint" className="text-[12px] text-[#6a6a6a]">Leave blank to keep your current SSN.</span>
                  </div>
                  <div className="flex flex-col gap-[6px] text-[14px] text-[#444]">
                    <label htmlFor="profile-phone">Phone Number</label>
                    <input id="profile-phone" type="tel" autoComplete="tel" value={draft.phoneNumber} onChange={(event) => setDraft({ ...draft, phoneNumber: event.target.value })} placeholder="e.g. +1 612 213 2314" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-[6px] text-[14px] text-[#444]">
                    <label htmlFor="profile-status">Filing Status</label>
                    <select id="profile-status" value={draft.maritalStatus} onChange={(event) => setDraft({ ...draft, maritalStatus: event.target.value })} className={inputClass}>
                      <option value="" disabled>Select status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-[12px]">
                    <button type="button" onClick={() => { setEditing(false); setDraft({ ssn: '', phoneNumber: '', maritalStatus: '' }); setError(''); }} className="cursor-pointer rounded-full border border-[#dcdcdc] px-[16px] py-[10px] text-[14px]">Cancel</button>
                    <button type="submit" className="cursor-pointer rounded-full bg-[#0094c5] px-[16px] py-[10px] text-[14px] font-semibold text-white">Save changes</button>
                  </div>
                </fieldset>
              </form>
            ) : (
              <div className="bg-white border border-[#e8e8e8] border-solid flex flex-col items-start overflow-clip rounded-[20px] shrink-0 w-full">
                <InfoRow label="Social Security Number" value={maskSsn(user?.ssn)} />
                <InfoRow label="Phone Number" value={formatPhone(user?.phone)} />
                <InfoRow label="Filing Status" value={user?.status || EMPTY} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="71:2403">
            <p className="font-semibold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Preferences</p>
            <div className="bg-white border border-[#e8e8e8] border-solid flex flex-col items-start overflow-clip rounded-[20px] shrink-0 w-full">
              <div className="flex items-center justify-between p-[16px] shrink-0 w-full">
                <div className="flex flex-col gap-[6px] items-start justify-center shrink-0">
                  <p className="font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap">Push Notifications</p>
                  <p className="font-normal leading-[normal] text-[12px] text-[#6a6a6a] whitespace-nowrap">IRS status changes &amp; messages</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pushEnabled}
                  aria-label="Push Notifications"
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`border border-[rgba(255,255,255,0.1)] border-solid cursor-pointer flex flex-col h-[26px] items-start justify-center p-[4px] rounded-[100px] shrink-0 w-[44px] transition-colors ${pushEnabled ? 'bg-[#0094c5]' : 'bg-[#cfcfcf]'}`}
                  data-node-id="71:2412"
                >
                  <span className={`bg-white rounded-[100px] shrink-0 size-[18px] transition-transform ${pushEnabled ? 'translate-x-[18px]' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="bg-[#ffecec] hover:bg-[#ffdede] transition-colors cursor-pointer flex gap-[12px] items-center justify-center px-[16px] py-[12px] rounded-[30px] shrink-0 w-full"
            data-node-id="71:2413"
          >
            <span className="relative shrink-0 size-[24px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignOut} />
            </span>
            <span className="font-bold leading-[normal] text-[15px] text-[#ea0101] text-left whitespace-nowrap">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
