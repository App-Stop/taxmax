import { useState } from 'react';
import { Modal, ModalHeader, TextField, SelectField, primaryButton, secondaryButton } from './ui';
import { STAFF_PERMISSIONS, STAFF_ROLES } from './adminData';

const A = '/figma/admin';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AccessCheck({ checked }) {
  return checked ? (
    <span className="bg-[#1d9834] flex items-center justify-center rounded-[61.538px] shrink-0 size-[24px]">
      <img alt="" className="block max-w-none" src={`${A}/check-white-11.svg`} width="11.0769" height="11.0769" />
    </span>
  ) : (
    <span className="border-[0.615px] border-[#b6b6b6] border-solid flex items-center justify-center rounded-[61.538px] shrink-0 size-[24px]">
      <img alt="" className="block max-w-none" src={`${A}/check-gray-11.svg`} width="11.0769" height="11.0769" />
    </span>
  );
}

// Add Staff Member (Node 87:1880)
export default function AddStaffModal({ existingEmails, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Staff');
  const [access, setAccess] = useState(['review', 'message']);
  const [error, setError] = useState('');

  const toggle = (id) => setAccess((list) => (list.includes(id) ? list.filter((a) => a !== id) : [...list, id]));

  const submit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim()) return setError('Enter the staff member’s full name.');
    if (!EMAIL_PATTERN.test(trimmedEmail)) return setError('Enter a valid email address.');
    if (existingEmails.includes(trimmedEmail)) return setError('A staff account with this email already exists.');
    onAdd({ name: name.trim(), email: trimmedEmail, role, access });
  };

  return (
    <Modal width={680} onClose={onClose} labelledBy="add-staff-title">
      <form onSubmit={submit} noValidate className="flex flex-col gap-[20px] items-start w-full">
        <ModalHeader id="add-staff-title" title="Add Staff Member" />
        <div className="flex flex-col sm:flex-row gap-[20px] sm:gap-[40px] items-start px-[16px] w-full">
          <div className="flex flex-[1_0_0] flex-col gap-[20px] items-start min-w-px w-full">
            <TextField id="staff-name" label="Full name" value={name} onChange={setName} placeholder="John Doe" />
            <TextField id="staff-email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="johndoe@gmail.com" />
            <SelectField id="staff-role" label="Role" value={role} options={STAFF_ROLES} onChange={setRole} />
          </div>
          <fieldset className="flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-px w-full">
            <legend className="font-semibold leading-[normal] text-[14px] text-[#848484] w-full mb-[10px]">Allow access to</legend>
            {STAFF_PERMISSIONS.map((p) => {
              const checked = access.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(p.id)}
                  className="flex gap-[10px] items-center justify-center max-w-[400px] py-[6px] w-full cursor-pointer text-left"
                >
                  <span className="flex-[1_0_0] font-medium leading-[22px] min-w-px text-[14px] text-[#111]">{p.label}</span>
                  <AccessCheck checked={checked} />
                </button>
              );
            })}
          </fieldset>
        </div>
        {error && <p role="alert" className="px-[16px] -mb-[8px] text-[13px] font-medium text-[#ea0101]">{error}</p>}
        <div className="flex gap-[10px] items-center justify-end p-[16px] w-full">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" className={primaryButton}>Add Member</button>
        </div>
      </form>
    </Modal>
  );
}
