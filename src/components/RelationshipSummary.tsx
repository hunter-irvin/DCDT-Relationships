import type { GraphRelationship, ViewConfig } from '../types/graph'

interface RelationshipSummaryProps {
  viewConfig: ViewConfig
  relationships: GraphRelationship[]
  objectCount: number
  visibleObjectCount: number
}

export function RelationshipSummary({
  viewConfig,
  relationships,
  objectCount,
  visibleObjectCount,
}: RelationshipSummaryProps) {
  const laneCounts = relationships.reduce<Record<string, number>>((counts, relationship) => {
    const key = relationship.thermalFlow ?? relationship.lane ?? relationship.type
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})

  const labelFor = (key: string) => {
    if (key === 'coldSupply') return 'cold supply'
    if (key === 'warmReturn') return 'warm return'
    return key
  }

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Visibility</h2>
      <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
        <div className="flex justify-between gap-3">
          <span>Objects</span>
          <strong className="font-semibold text-slate-900">
            {visibleObjectCount} / {objectCount}
          </strong>
        </div>
        <div className="mt-2 flex justify-between gap-3">
          <span>{viewConfig.relationshipType} edges</span>
          <strong className="font-semibold text-slate-900">{relationships.length}</strong>
        </div>
        {Object.entries(laneCounts).map(([lane, count]) => (
          <div key={lane} className="mt-2 flex justify-between gap-3 capitalize">
            <span>{labelFor(lane)}</span>
            <strong className="font-semibold text-slate-900">{count}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
