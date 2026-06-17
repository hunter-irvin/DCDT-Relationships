import { OBJECT_TYPE_LABELS } from '../data/objects'
import type { ObjectType } from '../types/graph'
import { TYPE_COLORS } from '../graph/nodeStyles'

interface FiltersProps {
  availableTypes: ObjectType[]
  activeTypes: ObjectType[]
  onToggle: (objectType: ObjectType) => void
}

export function Filters({ availableTypes, activeTypes, onToggle }: FiltersProps) {
  const activeSet = new Set(activeTypes)

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Object Types</h2>
      <div className="grid gap-2">
        {availableTypes.map((objectType) => {
          const colors = TYPE_COLORS[objectType]
          const isActive = activeSet.has(objectType)
          return (
            <label
              key={objectType}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors.dot }} />
                <span className="truncate">{OBJECT_TYPE_LABELS[objectType]}</span>
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggle(objectType)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
            </label>
          )
        })}
      </div>
    </section>
  )
}
