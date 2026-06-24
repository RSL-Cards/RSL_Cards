import { Crown, KeyRound, Mail, Plus } from 'lucide-react'
import { TeamMember, TeamRole } from './settingsTypes'
import { getStatusClass } from './settingsUtils'

interface TeamAccessSectionProps {
  inviteEmail: string
  inviteRole: TeamRole
  teamMembers: TeamMember[]
  onInviteEmailChange: (value: string) => void
  onInviteRoleChange: (value: TeamRole) => void
  onInviteTeamMember: () => void
  onTeamMembersChange: (members: TeamMember[]) => void
}

export default function TeamAccessSection({
  inviteEmail,
  inviteRole,
  teamMembers,
  onInviteEmailChange,
  onInviteRoleChange,
  onInviteTeamMember,
  onTeamMembersChange,
}: TeamAccessSectionProps) {
  const fieldClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Access</h2>
          <p className="mt-1 text-sm text-gray-500">Enterprise controls for role-based access and invitations.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Crown className="h-3.5 w-3.5" />
          Enterprise Tier
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={inviteEmail}
            onChange={(event) => onInviteEmailChange(event.target.value)}
            className={`${fieldClass} w-full pl-9`}
            placeholder="Invite by email"
          />
        </div>
        <select
          value={inviteRole}
          onChange={(event) => onInviteRoleChange(event.target.value as TeamRole)}
          className={fieldClass}
        >
          <option>Admin</option>
          <option>Lister</option>
          <option>Analyst</option>
        </select>
        <button
          type="button"
          onClick={onInviteTeamMember}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Invite
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-gray-50">
                <td className="py-4 pr-4">
                  <div className="font-semibold text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-400">{member.email}</div>
                </td>
                <td className="py-4 pr-4">
                  <select
                    value={member.role}
                    disabled={member.role === 'Owner'}
                    onChange={(event) =>
                      onTeamMembersChange(
                        teamMembers.map((item) =>
                          item.id === member.id
                            ? { ...item, role: event.target.value as TeamRole }
                            : item
                        )
                      )
                    }
                    className={`${fieldClass} min-w-32 disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option>Owner</option>
                    <option>Admin</option>
                    <option>Lister</option>
                    <option>Analyst</option>
                  </select>
                </td>
                <td className="py-4 pr-4">
                  <span className={getStatusClass(member.status)}>{member.status}</span>
                </td>
                <td className="py-4 pr-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                    {member.role === 'Owner'
                      ? 'Full workspace access'
                      : member.role === 'Admin'
                        ? 'Settings, listings, reports'
                        : member.role === 'Lister'
                          ? 'Inventory and listings'
                          : 'Read-only analytics'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
