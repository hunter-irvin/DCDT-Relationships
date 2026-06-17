import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { GraphCanvas } from '../components/GraphCanvas'
import { Sidebar } from '../components/Sidebar'
import { OBJECTS } from '../data/objects'
import { getViewConfig } from '../data/views'
import { buildGraphForView } from '../graph/buildGraphForView'
import type { ObjectType, ViewId } from '../types/graph'

const DEFAULT_TYPES: ObjectType[] = [
  'facility',
  'space',
  'containment',
  'layout',
  'rack',
  'compute',
  'power',
  'thermal',
  'controls',
]

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('facility')
  const [searchTerm, setSearchTerm] = useState('')
  const [showObjectImages, setShowObjectImages] = useState(true)
  const viewConfig = getViewConfig(activeView)

  const graph = useMemo(
    () =>
      buildGraphForView(activeView, {
        searchTerm,
        activeTypeFilters: DEFAULT_TYPES,
      }),
    [activeView, searchTerm],
  )

  return (
    <div className="flex h-screen min-h-0 flex-col bg-slate-100 text-slate-900">
      <Header activeView={viewConfig} />
      <main className="flex min-h-0 flex-1">
        <Sidebar
          activeViewId={activeView}
          viewConfig={viewConfig}
          searchTerm={searchTerm}
          availableTypes={graph.availableTypes}
          relationships={graph.visibleRelationships}
          objectCount={OBJECTS.filter((object) => object.views.includes(activeView)).length}
          visibleObjectCount={graph.visibleObjects.length}
          showObjectImages={showObjectImages}
          onViewChange={setActiveView}
          onSearchChange={setSearchTerm}
          onShowObjectImagesChange={setShowObjectImages}
        />
        <section className="relative min-w-0 flex-1 bg-white">
          <GraphCanvas nodes={graph.nodes} edges={graph.edges} layoutKey={activeView} showObjectImages={showObjectImages} />
        </section>
      </main>
    </div>
  )
}
