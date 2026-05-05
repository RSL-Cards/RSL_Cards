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
    <aside className="dashboard-card xl:col-span-1">
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
                  ? 'bg-accent-blue/15 text-white'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {section.label}
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
            </button>
          )
        })}
      </div>
    </aside>
  )
}
