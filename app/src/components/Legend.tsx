import { OBJECT_TYPE_LABELS } from '../data/objects'
import type { ObjectType, ViewConfig } from '../types/graph'
import { TYPE_COLORS } from '../graph/nodeStyles'

interface LegendProps {
  viewConfig: ViewConfig
  availableTypes: ObjectType[]
  showObjectImages: boolean
  onShowObjectImagesChange: (showObjectImages: boolean) => void
}

export function Legend({ viewConfig, availableTypes, showObjectImages, onShowObjectImagesChange }: LegendProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Legend</h2>
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <div className="mb-3 text-sm font-semibold text-slate-800">Node categories</div>
        <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span>Show object images</span>
          <input
            type="checkbox"
            checked={showObjectImages}
            onChange={(event) => onShowObjectImagesChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
        </label>
        <div className="grid gap-2">
          {availableTypes.map((objectType) => (
            <div key={objectType} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[objectType].dot }} />
              {OBJECT_TYPE_LABELS[objectType]}
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {viewConfig.relationshipType === 'hierarchical' ? 'Solid neutral lines show containment.' : 'Arrowed lines show directional flow.'}
        </div>
        {viewConfig.id === 'thermal' && (
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-7 rounded-full bg-sky-600" />
              Cold water supply
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-7 rounded-full bg-red-600" />
              Warm water return
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-7 rounded-full bg-teal-700" />
              Air cooling
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
