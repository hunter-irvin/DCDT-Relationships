import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  type NodeChange,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import { Maximize2, Minimize2, RotateCcw, Save, Square } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import { getDefaultAnchors, getNodeRect, type EdgeAnchor, type EdgeAnchors, type NodeRect } from '../graph/smartRouting'
import type { ViewId } from '../types/graph'
import type { ViewLayoutState } from '../types/layout'
import { SmartOrthogonalEdge } from './edges/SmartOrthogonalEdge'
import { DefaultNode } from './nodes/DefaultNode'

const nodeTypes = {
  defaultNode: DefaultNode,
}

const edgeTypes = {
  smartOrthogonal: SmartOrthogonalEdge,
}

interface GraphCanvasInnerProps {
  nodes: Node[]
  edges: Edge[]
  layoutKey: ViewId
  savedLayout: ViewLayoutState
  showObjectImages: boolean
  onSaveLayout: (viewId: ViewId, viewLayout: ViewLayoutState) => Promise<string>
}

type SaveStatus = 'saved' | 'dirty' | 'saving' | 'failed'

const SAVE_STATUS_LABELS: Record<SaveStatus, string> = {
  saved: 'Saved',
  dirty: 'Unsaved changes',
  saving: 'Saving...',
  failed: 'Save failed',
}

function GraphCanvasInner({ nodes, edges, layoutKey, savedLayout, showObjectImages, onSaveLayout }: GraphCanvasInnerProps) {
  const { fitView, setViewport } = useReactFlow()
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [edgeAnchors, setEdgeAnchors] = useState<Record<string, Partial<EdgeAnchors>>>({})
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const previousLayoutKey = useRef(layoutKey)
  const previousSavedLayout = useRef(savedLayout)

  const fitGraph = useCallback(() => {
    window.requestAnimationFrame(() => {
      fitView({ padding: 0.18, duration: 450 })
    })
  }, [fitView])

  useEffect(() => {
    const layoutChanged = previousLayoutKey.current !== layoutKey
    const savedLayoutChanged = previousSavedLayout.current !== savedLayout

    setLocalNodes((currentNodes) => {
      if (layoutChanged || savedLayoutChanged) {
        return applySavedNodePositions(nodes, savedLayout).map((node) => ({
          ...node,
          selected: false,
          data: { ...node.data, showImage: showObjectImages },
        }))
      }

      const currentPositions = new Map(currentNodes.map((node) => [node.id, node.position]))
      const currentSelections = new Map(currentNodes.map((node) => [node.id, node.selected]))
      return nodes.map((node) => ({
        ...node,
        position: currentPositions.get(node.id) ?? node.position,
        selected: currentSelections.get(node.id) ?? false,
        data: {
          ...node.data,
          showImage: showObjectImages,
        },
      }))
    })

    if (layoutChanged) {
      setSelectedEdgeId(null)
    }

    if (layoutChanged || savedLayoutChanged) {
      setEdgeAnchors({})
      setEdgeAnchors(filterSavedEdgeAnchors(savedLayout, edges))
      setSaveStatus('saved')
    }

    previousLayoutKey.current = layoutKey
    previousSavedLayout.current = savedLayout
  }, [edges, layoutKey, nodes, savedLayout, setLocalNodes, showObjectImages])

  useEffect(() => {
    fitGraph()
  }, [fitGraph, layoutKey, nodes.length, edges.length])

  const resetLayout = useCallback(() => {
    setSelectedEdgeId(null)
    setEdgeAnchors({})
    setLocalNodes(nodes.map((node) => ({ ...node, selected: false, data: { ...node.data, showImage: showObjectImages } })))
    setSaveStatus('dirty')
    setViewport({ x: 80, y: 80, zoom: 0.85 }, { duration: 250 })
    window.requestAnimationFrame(() => fitView({ padding: 0.18, duration: 450 }))
  }, [fitView, nodes, setLocalNodes, setViewport, showObjectImages])

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)

      if (changes.some((change) => change.type === 'position')) {
        setSaveStatus('dirty')
      }
    },
    [onNodesChange],
  )

  const nodeRects = useMemo(() => localNodes.map(getNodeRect), [localNodes])

  const defaultEdgeAnchors = useMemo(() => distributeDefaultAnchors(edges, nodeRects), [edges, nodeRects])

  const updateEdgeAnchor = useCallback((edgeId: string, endpoint: 'source' | 'target', anchor: EdgeAnchor) => {
    setEdgeAnchors((currentAnchors) => ({
      ...currentAnchors,
      [edgeId]: {
        ...(currentAnchors[edgeId] ?? {}),
        [endpoint]: anchor,
      },
    }))
    setSaveStatus('dirty')
  }, [])

  const saveCurrentLayout = useCallback(async () => {
    setSaveStatus('saving')

    try {
      await onSaveLayout(layoutKey, collectViewLayout(localNodes, edges, edgeAnchors))
      setSaveStatus('saved')
    } catch {
      setSaveStatus('failed')
    }
  }, [edgeAnchors, edges, layoutKey, localNodes, onSaveLayout])

  const smartEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'smartOrthogonal',
        data: {
          ...(edge.data ?? {}),
          nodeRects,
          anchors: {
            ...defaultEdgeAnchors[edge.id],
            ...(edgeAnchors[edge.id] ?? {}),
          },
          selectedEdgeId,
          onSelectEdge: setSelectedEdgeId,
          onAnchorChange: updateEdgeAnchor,
        },
      })),
    [defaultEdgeAnchors, edgeAnchors, edges, nodeRects, selectedEdgeId, updateEdgeAnchor],
  )

  return (
    <div className="relative h-full min-h-0 flex-1">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <button
            type="button"
            onClick={saveCurrentLayout}
            title="Save current layout"
            disabled={saveStatus === 'saving'}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <Save size={16} aria-hidden="true" />
          </button>
          <span className="min-w-24 text-xs font-semibold text-slate-600">{SAVE_STATUS_LABELS[saveStatus]}</span>
        </div>
        <button
          type="button"
          onClick={fitGraph}
          title="Fit graph"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-400"
        >
          <Maximize2 size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={resetLayout}
          title="Reset layout"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-400"
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="absolute bottom-4 right-4 z-20">
        {isPreviewCollapsed ? (
          <button
            type="button"
            onClick={() => setIsPreviewCollapsed(false)}
            title="Show preview"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-400"
          >
            <Square size={17} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsPreviewCollapsed(true)}
            title="Hide preview"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-400"
          >
            <Minimize2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <ReactFlow
        nodes={localNodes}
        edges={smartEdges}
        onNodesChange={handleNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        selectNodesOnDrag
        onPaneClick={() => setSelectedEdgeId(null)}
        proOptions={{ hideAttribution: true }}
      >
        {!isPreviewCollapsed && (
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={3}
            className="!bottom-4 !right-4 !border !border-slate-200 !bg-white"
          />
        )}
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

const distributeDefaultAnchors = (edges: Edge[], nodeRects: NodeRect[]) => {
  const rectById = new Map(nodeRects.map((rect) => [rect.id, rect]))
  const anchorsByEdge: Record<string, Partial<EdgeAnchors>> = {}
  const endpointGroups = new Map<
    string,
    Array<{ edgeId: string; endpoint: 'source' | 'target'; neighborRect: NodeRect; anchor: EdgeAnchor }>
  >()

  edges.forEach((edge) => {
    const sourceRect = rectById.get(edge.source)
    const targetRect = rectById.get(edge.target)
    if (!sourceRect || !targetRect) return

    const anchors = getDefaultAnchors(sourceRect, targetRect)
    anchorsByEdge[edge.id] = anchors

    const endpoints = [
      { endpoint: 'source' as const, nodeId: edge.source, neighborRect: targetRect, anchor: anchors.source },
      { endpoint: 'target' as const, nodeId: edge.target, neighborRect: sourceRect, anchor: anchors.target },
    ]

    endpoints.forEach((entry) => {
      const key = `${entry.nodeId}:${entry.anchor.side}`
      const group = endpointGroups.get(key) ?? []
      group.push({ edgeId: edge.id, endpoint: entry.endpoint, neighborRect: entry.neighborRect, anchor: entry.anchor })
      endpointGroups.set(key, group)
    })
  })

  endpointGroups.forEach((group) => {
    if (group.length < 2) return

    const sortedGroup = group.slice().sort((a, b) => {
      const horizontalSide = a.anchor.side === 'top' || a.anchor.side === 'bottom'
      const aCenter = horizontalSide ? a.neighborRect.x + a.neighborRect.width / 2 : a.neighborRect.y + a.neighborRect.height / 2
      const bCenter = horizontalSide ? b.neighborRect.x + b.neighborRect.width / 2 : b.neighborRect.y + b.neighborRect.height / 2
      return aCenter - bCenter
    })

    sortedGroup.forEach((entry, index) => {
      const offset = (index + 1) / (sortedGroup.length + 1)
      anchorsByEdge[entry.edgeId] = {
        ...(anchorsByEdge[entry.edgeId] ?? {}),
        [entry.endpoint]: {
          ...entry.anchor,
          offset,
        },
      }
    })
  })

  return anchorsByEdge
}

interface GraphCanvasProps {
  nodes: Node[]
  edges: Edge[]
  layoutKey: ViewId
  savedLayout: ViewLayoutState
  showObjectImages: boolean
  onSaveLayout: (viewId: ViewId, viewLayout: ViewLayoutState) => Promise<string>
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

const applySavedNodePositions = (nodes: Node[], savedLayout: ViewLayoutState) =>
  nodes.map((node) => {
    const savedPosition = savedLayout.nodePositions[node.id]
    return savedPosition ? { ...node, position: savedPosition } : node
  })

const filterSavedEdgeAnchors = (savedLayout: ViewLayoutState, edges: Edge[]) => {
  const edgeIds = new Set(edges.map((edge) => edge.id))

  return Object.fromEntries(
    Object.entries(savedLayout.edgeAnchors).filter(([edgeId, anchors]) => edgeIds.has(edgeId) && (anchors.source || anchors.target)),
  )
}

const collectViewLayout = (
  nodes: Node[],
  edges: Edge[],
  edgeAnchors: Record<string, Partial<EdgeAnchors>>,
): ViewLayoutState => {
  const edgeIds = new Set(edges.map((edge) => edge.id))

  return {
    nodePositions: Object.fromEntries(nodes.map((node) => [node.id, node.position])),
    edgeAnchors: Object.fromEntries(
      Object.entries(edgeAnchors).filter(([edgeId, anchors]) => edgeIds.has(edgeId) && (anchors.source || anchors.target)),
    ),
  }
}
