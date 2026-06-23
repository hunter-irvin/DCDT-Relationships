import {
  VIEW_IDS,
  createEmptySharedLayout,
  type LayoutAnchor,
  type LayoutEdgeAnchors,
  type LayoutViewId,
  type SharedLayoutState,
  type ViewLayoutState,
} from '../types/layout'

const ANCHOR_SIDES = new Set(['top', 'right', 'bottom', 'left'])
const MAX_LAYOUT_BYTES = 250_000

export class LayoutValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LayoutValidationError'
  }
}

export const assertLayoutPayloadSize = (payload: string) => {
  if (new TextEncoder().encode(payload).length > MAX_LAYOUT_BYTES) {
    throw new LayoutValidationError('Layout payload is too large')
  }
}

export const parseSharedLayoutPayload = (payload: unknown): SharedLayoutState => {
  if (!isRecord(payload) || !isRecord(payload.layout)) {
    throw new LayoutValidationError('layout is required')
  }

  return normalizeSharedLayout(payload.layout)
}

export const parseViewLayoutPayload = (payload: unknown): { viewId: LayoutViewId; viewLayout: ViewLayoutState } => {
  if (!isRecord(payload) || typeof payload.viewId !== 'string' || !VIEW_IDS.includes(payload.viewId as LayoutViewId)) {
    throw new LayoutValidationError('valid viewId is required')
  }

  if (!isRecord(payload.viewLayout)) {
    throw new LayoutValidationError('viewLayout is required')
  }

  return {
    viewId: payload.viewId as LayoutViewId,
    viewLayout: normalizeViewLayout(payload.viewLayout, payload.viewId),
  }
}

export const normalizeSharedLayout = (value: unknown): SharedLayoutState => {
  if (!isRecord(value)) {
    throw new LayoutValidationError('layout must be an object')
  }

  const layout = createEmptySharedLayout()

  VIEW_IDS.forEach((viewId) => {
    const viewValue = value[viewId]
    layout[viewId] = viewValue === undefined ? createEmptyViewState() : normalizeViewLayout(viewValue, viewId)
  })

  return layout
}

export const normalizeViewLayout = (value: unknown, viewId: string): ViewLayoutState => {
  if (!isRecord(value)) {
    throw new LayoutValidationError(`${viewId} layout must be an object`)
  }

  if (!isRecord(value.nodePositions)) {
    throw new LayoutValidationError(`${viewId}.nodePositions must be an object`)
  }

  if (!isRecord(value.edgeAnchors)) {
    throw new LayoutValidationError(`${viewId}.edgeAnchors must be an object`)
  }

  return {
    nodePositions: Object.fromEntries(
      Object.entries(value.nodePositions).map(([nodeId, position]) => [nodeId, normalizePosition(position, nodeId)]),
    ),
    edgeAnchors: Object.fromEntries(
      Object.entries(value.edgeAnchors).map(([edgeId, anchors]) => [edgeId, normalizeEdgeAnchors(anchors, edgeId)]),
    ),
  }
}

const normalizePosition = (value: unknown, nodeId: string) => {
  if (!isRecord(value) || !isFiniteNumber(value.x) || !isFiniteNumber(value.y)) {
    throw new LayoutValidationError(`Invalid node position for ${nodeId}`)
  }

  return { x: value.x, y: value.y }
}

const normalizeEdgeAnchors = (value: unknown, edgeId: string): LayoutEdgeAnchors => {
  if (!isRecord(value)) {
    throw new LayoutValidationError(`Invalid edge anchors for ${edgeId}`)
  }

  Object.keys(value).forEach((key) => {
    if (key !== 'source' && key !== 'target') {
      throw new LayoutValidationError(`Invalid edge anchor endpoint for ${edgeId}`)
    }
  })

  const anchors: LayoutEdgeAnchors = {}

  if (value.source !== undefined) anchors.source = normalizeAnchor(value.source, `${edgeId}.source`)
  if (value.target !== undefined) anchors.target = normalizeAnchor(value.target, `${edgeId}.target`)

  return anchors
}

const normalizeAnchor = (value: unknown, label: string): LayoutAnchor => {
  if (!isRecord(value) || typeof value.side !== 'string' || !ANCHOR_SIDES.has(value.side) || !isFiniteNumber(value.offset)) {
    throw new LayoutValidationError(`Invalid edge anchor for ${label}`)
  }

  if (value.offset < 0 || value.offset > 1) {
    throw new LayoutValidationError(`Edge anchor offset out of range for ${label}`)
  }

  return { side: value.side as LayoutAnchor['side'], offset: value.offset }
}

const createEmptyViewState = (): ViewLayoutState => ({
  nodePositions: {},
  edgeAnchors: {},
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
