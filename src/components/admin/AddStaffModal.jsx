import { useState } from 'react';
import { Modal, ModalHeader, TextField, primaryButton, secondaryButton } from './ui';
import { ApiError } from '../../services/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server field paths -> the field they belong to here.
const FIELD_FOR = { 'body.fullName': 'fullName', 'body.email': 'email', 'body.roleName': 'roleName' };

// Add Staff Member (Node 87:1880). Members are always staff-level; the role name is a label
// ("Accountant", "Reviewer"). `onSubmit` returns a promise; its error is shown here.
// With `member`, edits that member's name and role name instead.
export default function AddStaffModal({ member, onClose, onSubmit }) {
  const editing = Boolean(member);
  const [fullName, setFullName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [roleName, setRoleName] = useState(member?.roleName || 'Staff');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter the staff member’s full name.';
    if (!editing && !EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (roleName.trim().length < 2) next.roleName = 'Role name must be at least 2 characters.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await onSubmit({ fullName: fullName.trim(), email: email.trim().toLowerCase(), roleName: roleName.trim() });
    } catch (err) {
      // 422: per-field messages; 409: the email is taken; anything else: shown as is.
      const fieldErrors = {};
      if (err instanceof ApiError) {
        err.fieldErrors.forEach(({ path, message }) => {
          const field = FIELD_FOR[path];
          if (field && !fieldErrors[field]) fieldErrors[field] = message;
        });
        if (err.status === 409) fieldErrors.email = err.message;
      }
      setErrors(fieldErrors);
      if (!Object.keys(fieldErrors).length) setFormError(err.message);
      setBusy(false);
    }
  };

  const fieldError = (name) => errors[name] && <p role="alert" className="-mt-[12px] text-[12px] font-medium text-[#ea0101]">{errors[name]}</p>;

  return (
    <Modal width={520} onClose={onClose} labelledBy="add-staff-title">
      <form onSubmit={submit} noValidate className="flex flex-col gap-[20px] items-start w-full">
        <ModalHeader
          id="add-staff-title"
          title={editing ? 'Edit Staff Member' : 'Add Staff Member'}
          subtitle={editing ? null : 'They sign in with a one-time code sent to this email.'}
        />
        <div className="flex flex-col gap-[20px] items-start px-[16px] w-full">
          <TextField id="staff-name" label="Full name" value={fullName} onChange={setFullName} placeholder="John Doe" />
          {fieldError('fullName')}
          {!editing && (
            <>
              <TextField id="staff-email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="johndoe@gmail.com" />
              {fieldError('email')}
            </>
          )}
          <TextField id="staff-role" label="Role name" value={roleName} onChange={setRoleName} placeholder="Staff, Accountant, Reviewer…" />
          {fieldError('roleName')}
          <p className="-mt-[10px] text-[12px] text-[#6a6a6a]">
            The role name is a label only. Every member added here has staff access; admins are created on the server.
          </p>
        </div>
        {formError && <p role="alert" className="px-[16px] -mb-[8px] text-[13px] font-medium text-[#ea0101]">{formError}</p>}
        <div className="flex gap-[10px] items-center justify-end p-[16px] w-full">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
