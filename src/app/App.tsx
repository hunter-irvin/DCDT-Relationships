import { useEffect, useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { GraphCanvas } from '../components/GraphCanvas'
import { Sidebar } from '../components/Sidebar'
import { getFallbackSharedLayout, loadSharedLayout, saveViewLayout as saveViewLayoutApi } from '../api/layout'
import { OBJECTS } from '../data/objects'
import { getViewConfig } from '../data/views'
import { buildGraphForView } from '../graph/buildGraphForView'
import type { ObjectType, ViewId } from '../types/graph'
import type { SharedLayoutState, ViewLayoutState } from '../types/layout'

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
  const [sharedLayout, setSharedLayout] = useState<SharedLayoutState>(() => getFallbackSharedLayout())
  const viewConfig = getViewConfig(activeView)

  useEffect(() => {
    let isMounted = true

    loadSharedLayout()
      .then((response) => {
        if (isMounted) setSharedLayout(response.layout)
      })
      .catch(() => {
        if (isMounted) setSharedLayout(getFallbackSharedLayout())
      })

    return () => {
      isMounted = false
    }
  }, [])

  const saveViewLayout = async (viewId: ViewId, viewLayout: ViewLayoutState) => {
    const response = await saveViewLayoutApi(viewId, viewLayout)
    setSharedLayout(response.layout)
    return response.updatedAt
  }

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
          <GraphCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            layoutKey={activeView}
            savedLayout={sharedLayout[activeView]}
            showObjectImages={showObjectImages}
            onSaveLayout={saveViewLayout}
          />
        </section>
      </main>
    </div>
  )
}
