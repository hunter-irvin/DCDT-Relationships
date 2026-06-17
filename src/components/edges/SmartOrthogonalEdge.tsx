import { useCallback, type PointerEvent as ReactPointerEvent } from 'react'
import type { EdgeProps, XYPosition } from '@xyflow/react'
import { EdgeLabelRenderer, useReactFlow } from '@xyflow/react'
import type { EdgeAnchor, EdgeAnchors, NodeRect } from '../../graph/smartRouting'
import {
  getDefaultAnchors,
  pointForAnchor,
  pointsToPath,
  routeOrthogonalPoints,
  snapPointToRectBoundary,
  stubPointForAnchor,
} from '../../graph/smartRouting'

interface SmartEdgeData extends Record<string, unknown> {
  nodeRects: NodeRect[]
  anchors?: Partial<EdgeAnchors>
  selectedEdgeId?: string | null
  onSelectEdge?: (edgeId: string) => void
  onAnchorChange?: (edgeId: string, endpoint: 'source' | 'target', anchor: EdgeAnchor) => void
  stroke?: string
  isDirectional?: boolean
}

export function SmartOrthogonalEdge({
  id,
  source,
  target,
  markerEnd,
  style,
  label,
  data,
}: EdgeProps) {
  const edgeData = data as SmartEdgeData | undefined
  const { screenToFlowPosition } = useReactFlow()
  const nodeRects = edgeData?.nodeRects ?? []
  const sourceRect = nodeRects.find((rect) => rect.id === source)
  const targetRect = nodeRects.find((rect) => rect.id === target)

  const startAnchorDrag = useCallback(
    (endpoint: 'source' | 'target', rect: NodeRect) => (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const move = (moveEvent: globalThis.PointerEvent) => {
        const flowPoint = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY })
        edgeData?.onAnchorChange?.(id, endpoint, snapPointToRectBoundary(flowPoint, rect))
      }

      const stop = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', stop)
      }

      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', stop)
    },
    [edgeData, id, screenToFlowPosition],
  )

  if (!sourceRect || !targetRect) return null

  const defaultAnchors = getDefaultAnchors(sourceRect, targetRect)
  const anchors = {
    source: edgeData?.anchors?.source ?? defaultAnchors.source,
    target: edgeData?.anchors?.target ?? defaultAnchors.target,
  }
  const sourcePoint = pointForAnchor(sourceRect, anchors.source)
  const targetPoint = pointForAnchor(targetRect, anchors.target)
  const sourceStub = stubPointForAnchor(sourcePoint, anchors.source)
  const targetStub = stubPointForAnchor(targetPoint, anchors.target)
  const obstacles = nodeRects.filter((rect) => rect.id !== source && rect.id !== target)
  const routedPoints = routeOrthogonalPoints(sourceStub, targetStub, obstacles)
  const path = pointsToPath([sourcePoint, sourceStub, ...routedPoints.slice(1, -1), targetStub, targetPoint])
  const isSelected = edgeData?.selectedEdgeId === id
  const stroke = String(edgeData?.stroke ?? style?.stroke ?? '#64748b')
  const strokeWidth = Number(style?.strokeWidth ?? 2)

  const labelPoint: XYPosition = {
    x: (sourcePoint.x + targetPoint.x) / 2,
    y: (sourcePoint.y + targetPoint.y) / 2,
  }

  return (
    <g className={isSelected ? 'smart-edge selected' : 'smart-edge'}>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        className="react-flow__edge-interaction nodrag nopan"
        onClick={(event) => {
          event.stopPropagation()
          edgeData?.onSelectEdge?.(id)
        }}
      />
      <path
        d={path}
        fill="none"
        markerEnd={markerEnd}
        stroke={stroke}
        strokeWidth={isSelected ? strokeWidth + 1.2 : strokeWidth}
        strokeDasharray={style?.strokeDasharray}
        className="react-flow__edge-path"
        onClick={(event) => {
          event.stopPropagation()
          edgeData?.onSelectEdge?.(id)
        }}
      />
      {edgeData?.isDirectional && (
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={Math.max(1.6, strokeWidth - 0.4)}
          strokeDasharray="9 14"
          className="smart-edge-flow pointer-events-none"
        />
      )}
      {label && (
        <text
          x={labelPoint.x}
          y={labelPoint.y - 8}
          className="pointer-events-none fill-slate-600 text-[12px] font-semibold"
          textAnchor="middle"
        >
          {String(label)}
        </text>
      )}
      {isSelected && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan smart-edge-anchor absolute h-4 w-4 cursor-grab rounded-full border-2 border-sky-600 bg-white shadow"
            style={{
              transform: `translate(-50%, -50%) translate(${sourcePoint.x}px, ${sourcePoint.y}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            onPointerDown={startAnchorDrag('source', sourceRect)}
          />
          <div
            className="nodrag nopan smart-edge-anchor absolute h-4 w-4 cursor-grab rounded-full border-2 border-sky-600 bg-white shadow"
            style={{
              transform: `translate(-50%, -50%) translate(${targetPoint.x}px, ${targetPoint.y}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            onPointerDown={startAnchorDrag('target', targetRect)}
          />
        </EdgeLabelRenderer>
      )}
    </g>
  )
}
