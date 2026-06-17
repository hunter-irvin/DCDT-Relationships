import type { XYPosition } from '@xyflow/react'

export type AnchorSide = 'top' | 'right' | 'bottom' | 'left'

export interface EdgeAnchor {
  side: AnchorSide
  offset: number
}

export interface EdgeAnchors {
  source: EdgeAnchor
  target: EdgeAnchor
}

export interface NodeRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

const NODE_PADDING = 18
const ANCHOR_STUB = 28

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

export const getNodeRect = (node: {
  id: string
  position: XYPosition
  measured?: { width?: number; height?: number }
  width?: number
  height?: number
}): NodeRect => ({
  id: node.id,
  x: node.position.x,
  y: node.position.y,
  width: node.measured?.width ?? node.width ?? 190,
  height: node.measured?.height ?? node.height ?? 54,
})

export const getDefaultAnchors = (sourceRect: NodeRect, targetRect: NodeRect): EdgeAnchors => {
  const sourceCenter = centerOf(sourceRect)
  const targetCenter = centerOf(targetRect)
  const dx = targetCenter.x - sourceCenter.x
  const dy = targetCenter.y - sourceCenter.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    return {
      source: { side: dx >= 0 ? 'right' : 'left', offset: 0.5 },
      target: { side: dx >= 0 ? 'left' : 'right', offset: 0.5 },
    }
  }

  return {
    source: { side: dy >= 0 ? 'bottom' : 'top', offset: 0.5 },
    target: { side: dy >= 0 ? 'top' : 'bottom', offset: 0.5 },
  }
}

export const pointForAnchor = (rect: NodeRect, anchor: EdgeAnchor): XYPosition => {
  if (anchor.side === 'top') return { x: rect.x + rect.width * anchor.offset, y: rect.y }
  if (anchor.side === 'bottom') return { x: rect.x + rect.width * anchor.offset, y: rect.y + rect.height }
  if (anchor.side === 'left') return { x: rect.x, y: rect.y + rect.height * anchor.offset }
  return { x: rect.x + rect.width, y: rect.y + rect.height * anchor.offset }
}

export const stubPointForAnchor = (point: XYPosition, anchor: EdgeAnchor): XYPosition => {
  if (anchor.side === 'top') return { x: point.x, y: point.y - ANCHOR_STUB }
  if (anchor.side === 'bottom') return { x: point.x, y: point.y + ANCHOR_STUB }
  if (anchor.side === 'left') return { x: point.x - ANCHOR_STUB, y: point.y }
  return { x: point.x + ANCHOR_STUB, y: point.y }
}

export const snapPointToRectBoundary = (point: XYPosition, rect: NodeRect): EdgeAnchor => {
  const distances = [
    { side: 'top' as const, distance: Math.abs(point.y - rect.y), offset: (point.x - rect.x) / rect.width },
    {
      side: 'bottom' as const,
      distance: Math.abs(point.y - (rect.y + rect.height)),
      offset: (point.x - rect.x) / rect.width,
    },
    { side: 'left' as const, distance: Math.abs(point.x - rect.x), offset: (point.y - rect.y) / rect.height },
    {
      side: 'right' as const,
      distance: Math.abs(point.x - (rect.x + rect.width)),
      offset: (point.y - rect.y) / rect.height,
    },
  ]

  const closest = distances.sort((a, b) => a.distance - b.distance)[0]
  return { side: closest.side, offset: clamp(closest.offset) }
}

export const routeOrthogonalPath = (source: XYPosition, target: XYPosition, obstacles: NodeRect[]) => {
  return pointsToPath(routeOrthogonalPoints(source, target, obstacles))
}

export const routeOrthogonalPoints = (source: XYPosition, target: XYPosition, obstacles: NodeRect[]) => {
  const candidates = buildCandidates(source, target, obstacles)
    .map(simplifyPoints)
    .sort((a, b) => scorePath(a) - scorePath(b))

  const openPath = candidates.find((points) => !pathIntersectsObstacles(points, obstacles))
  return openPath ?? candidates[0] ?? [source, target]
}

export const pointsToPath = (points: XYPosition[]) =>
  simplifyPoints(points)
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${round(point.x)} ${round(point.y)}`)
    .join(' ')

const centerOf = (rect: NodeRect): XYPosition => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
})

const buildCandidates = (source: XYPosition, target: XYPosition, obstacles: NodeRect[]) => {
  const midX = (source.x + target.x) / 2
  const midY = (source.y + target.y) / 2
  const candidateXs = new Set<number>([midX, source.x, target.x])
  const candidateYs = new Set<number>([midY, source.y, target.y])

  obstacles.forEach((rect) => {
    candidateXs.add(rect.x - NODE_PADDING)
    candidateXs.add(rect.x + rect.width + NODE_PADDING)
    candidateYs.add(rect.y - NODE_PADDING)
    candidateYs.add(rect.y + rect.height + NODE_PADDING)
  })

  const candidates: XYPosition[][] = []

  if (source.x === target.x || source.y === target.y) {
    candidates.push([source, target])
  }

  candidates.push([source, { x: source.x, y: target.y }, target])
  candidates.push([source, { x: target.x, y: source.y }, target])

  Array.from(candidateXs).forEach((x) => {
    candidates.push([source, { x, y: source.y }, { x, y: target.y }, target])
  })

  Array.from(candidateYs).forEach((y) => {
    candidates.push([source, { x: source.x, y }, { x: target.x, y }, target])
  })

  return candidates
}

const simplifyPoints = (points: XYPosition[]) => {
  const deduped = points.filter((point, index) => {
    const previous = points[index - 1]
    return !previous || previous.x !== point.x || previous.y !== point.y
  })

  return deduped.filter((point, index) => {
    const previous = deduped[index - 1]
    const next = deduped[index + 1]
    if (!previous || !next) return true
    const vertical = previous.x === point.x && point.x === next.x
    const horizontal = previous.y === point.y && point.y === next.y
    return !vertical && !horizontal
  })
}

const scorePath = (points: XYPosition[]) => {
  const distance = points.reduce((total, point, index) => {
    const previous = points[index - 1]
    if (!previous) return total
    return total + Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y)
  }, 0)

  return (points.length - 2) * 10000 + distance
}

const pathIntersectsObstacles = (points: XYPosition[], obstacles: NodeRect[]) =>
  points.some((point, index) => {
    const next = points[index + 1]
    return next ? obstacles.some((rect) => segmentIntersectsRect(point, next, paddedRect(rect))) : false
  })

const paddedRect = (rect: NodeRect): NodeRect => ({
  ...rect,
  x: rect.x - NODE_PADDING,
  y: rect.y - NODE_PADDING,
  width: rect.width + NODE_PADDING * 2,
  height: rect.height + NODE_PADDING * 2,
})

const segmentIntersectsRect = (start: XYPosition, end: XYPosition, rect: NodeRect) => {
  if (start.x === end.x) {
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)
    return start.x > rect.x && start.x < rect.x + rect.width && maxY > rect.y && minY < rect.y + rect.height
  }

  if (start.y === end.y) {
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    return start.y > rect.y && start.y < rect.y + rect.height && maxX > rect.x && minX < rect.x + rect.width
  }

  return false
}

const round = (value: number) => Math.round(value * 10) / 10
