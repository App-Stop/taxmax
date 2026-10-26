import { Icon } from './ui';
import { initialsOf } from './adminData';

const A = '/figma/admin';

const itemClass =
  'flex gap-[8px] items-center px-[20px] py-[16px] w-full text-left cursor-pointer transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50';
const labelClass = 'font-normal leading-[20px] text-[14px] text-[#111] whitespace-nowrap';

// Submission queue row options (Node 87:3833). `team` is the active team list, or null for
// staff, who can't read it or change assignees, so the "Assign to" section is left out.
export default function SubmissionOptionsMenu({ assigneeIds, team, busy, onMessage, onPreview, onExportPdf, onToggleAssignee }) {
  const actions = [
    { key: 'message', icon: 'options-paper-plane.svg', label: 'Message client', onSelect: onMessage },
    { key: 'preview', icon: 'options-eye.svg', label: 'Preview', onSelect: onPreview },
    { key: 'export', icon: 'options-download.svg', label: 'Export PDF', onSelect: onExportPdf },
  ];

  return (
    <div className="flex flex-col gap-[10px] items-start w-[240px]">
      <div role="menu" aria-label="Submission actions" className="flex flex-col items-start w-full">
        {actions.map((action) => (
          <button key={action.key} type="button" role="menuitem" onClick={action.onSelect} className={itemClass}>
            <Icon src={`${A}/${action.icon}`} size={20} />
            <span className={labelClass}>{action.label}</span>
          </button>
        ))}
      </div>

      {team && (
        <div role="menu" aria-label="Assign to" className="flex flex-col items-start w-full">
          <p className="px-[20px] font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap">
            Assign to
          </p>
          <div className="flex flex-col w-full max-h-[260px] overflow-y-auto">
            {team.length === 0 && <p className={`px-[20px] py-[16px] ${labelClass} text-[#6a6a6a]`}>No active team members</p>}
            {team.map((member) => {
              const assigned = assigneeIds.includes(member._id);
              return (
                <button
                  key={member._id}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={assigned}
                  disabled={busy}
                  onClick={() => onToggleAssignee(member._id)}
                  className={itemClass}
                >
                  <span className="bg-[#e8e8e8] flex items-center justify-center rounded-[125px] shrink-0 size-[20px]">
                    <span className="font-['Geist',sans-serif] font-medium leading-[10px] text-[7.5px] text-[#6a6a6a]">{initialsOf(member.fullName || '')}</span>
                  </span>
                  <span className="flex flex-1 gap-[8px] items-center min-w-0">
                    <span className={`flex-1 min-w-0 overflow-hidden text-ellipsis ${labelClass}`}>{member.fullName}</span>
                    {assigned && <Icon src={`${A}/options-check.svg`} size={20} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
