import { Building2, Flame, Zap } from 'lucide-react'
import { VIEW_CONFIGS } from '../data/views'
import type { ViewId } from '../types/graph'

interface ViewSwitcherProps {
  activeViewId: ViewId
  onChange: (viewId: ViewId) => void
}

const icons = {
  facility: Building2,
  power_train: Zap,
  thermal_chain: Flame,
}

export function ViewSwitcher({ activeViewId, onChange }: ViewSwitcherProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Views</h2>
      <div className="grid gap-2">
        {VIEW_CONFIGS.map((view) => {
          const Icon = icons[view.id]
          const isActive = view.id === activeViewId
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => onChange(view.id)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {view.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
