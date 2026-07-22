import { ChevronRight } from 'lucide-react'
import { SettingsSection } from './settingsTypes'
import { sections } from './settingsUtils'

interface SettingsSidebarProps {
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}

export default function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <aside className="dashboard-card border border-[#252525] bg-[#0D0D0D] p-3 shadow-sm rounded-2xl xl:col-span-1">
      <div className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C]'
                  : 'text-zinc-400 hover:bg-[#141414] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {section.label}
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-[#E8001C]' : 'text-zinc-500'}`} />
            </button>
          )
        })}
      </div>
    </aside>
  )
}
