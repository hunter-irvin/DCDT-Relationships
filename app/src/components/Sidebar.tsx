import type { GraphRelationship, ObjectType, ViewConfig, ViewId } from '../types/graph'
import { Legend } from './Legend'
import { RelationshipSummary } from './RelationshipSummary'
import { SearchBox } from './SearchBox'
import { ViewSwitcher } from './ViewSwitcher'

interface SidebarProps {
  activeViewId: ViewId
  viewConfig: ViewConfig
  searchTerm: string
  availableTypes: ObjectType[]
  relationships: GraphRelationship[]
  objectCount: number
  visibleObjectCount: number
  showObjectImages: boolean
  onViewChange: (viewId: ViewId) => void
  onSearchChange: (value: string) => void
  onShowObjectImagesChange: (showObjectImages: boolean) => void
}

export function Sidebar({
  activeViewId,
  viewConfig,
  searchTerm,
  availableTypes,
  relationships,
  objectCount,
  visibleObjectCount,
  showObjectImages,
  onViewChange,
  onSearchChange,
  onShowObjectImagesChange,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
      <ViewSwitcher activeViewId={activeViewId} onChange={onViewChange} />
      <SearchBox value={searchTerm} onChange={onSearchChange} />
      <Legend
        viewConfig={viewConfig}
        availableTypes={availableTypes}
        showObjectImages={showObjectImages}
        onShowObjectImagesChange={onShowObjectImagesChange}
      />
      <RelationshipSummary
        viewConfig={viewConfig}
        relationships={relationships}
        objectCount={objectCount}
        visibleObjectCount={visibleObjectCount}
      />
    </aside>
  )
}
