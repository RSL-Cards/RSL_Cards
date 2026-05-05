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
  return (
    <section className="dashboard-card">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Team Access</h2>
          <p className="mt-1 text-sm text-text-secondary">Enterprise controls for role-based access and invitations.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
          <Crown className="h-3.5 w-3.5" />
          Enterprise Tier
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={inviteEmail}
            onChange={(event) => onInviteEmailChange(event.target.value)}
            className="dashboard-input w-full pl-9"
            placeholder="Invite by email"
          />
        </div>
        <select
          value={inviteRole}
          onChange={(event) => onInviteRoleChange(event.target.value as TeamRole)}
          className="dashboard-input"
        >
          <option>Admin</option>
          <option>Lister</option>
          <option>Analyst</option>
        </select>
        <button
          type="button"
          onClick={onInviteTeamMember}
          className="btn-primary inline-flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Invite
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Member</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Role</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="py-4 pr-4">
                  <div className="font-semibold text-white">{member.name}</div>
                  <div className="text-sm text-text-muted">{member.email}</div>
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
                    className="dashboard-input"
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
                <td className="py-4 pr-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-text-muted" />
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
