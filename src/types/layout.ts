import type { ViewId } from './graph'

export type LayoutViewId = ViewId

export interface LayoutPosition {
  x: number
  y: number
}

export type LayoutAnchorSide = 'top' | 'right' | 'bottom' | 'left'

export interface LayoutAnchor {
  side: LayoutAnchorSide
  offset: number
}

export interface LayoutEdgeAnchors {
  source?: LayoutAnchor
  target?: LayoutAnchor
}

export interface ViewLayoutState {
  nodePositions: Record<string, LayoutPosition>
  edgeAnchors: Record<string, LayoutEdgeAnchors>
}

export type SharedLayoutState = Record<LayoutViewId, ViewLayoutState>

export interface LayoutApiResponse {
  layout: SharedLayoutState
  updatedAt: string | null
}

export interface LayoutSaveResponse {
  ok: true
  layout: SharedLayoutState
  updatedAt: string
}

export interface ViewLayoutSaveRequest {
  viewId: LayoutViewId
  viewLayout: ViewLayoutState
}

export const VIEW_IDS: LayoutViewId[] = ['facility', 'thermal_chain', 'power_train']

export const createEmptyViewLayout = (): ViewLayoutState => ({
  nodePositions: {},
  edgeAnchors: {},
})

export const createEmptySharedLayout = (): SharedLayoutState => ({
  facility: createEmptyViewLayout(),
  thermal_chain: createEmptyViewLayout(),
  power_train: createEmptyViewLayout(),
})
