import {
  createEmptySharedLayout,
  type LayoutApiResponse,
  type LayoutSaveResponse,
  type LayoutViewId,
  type SharedLayoutState,
  type ViewLayoutState,
} from '../types/layout'
import { normalizeSharedLayout } from '../layout/validation'

const LAYOUT_ENDPOINT = '/api/layout'

export const loadSharedLayout = async (): Promise<LayoutApiResponse> => {
  const response = await fetch(LAYOUT_ENDPOINT)

  if (!response.ok) {
    throw new Error(`Layout load failed: ${response.status}`)
  }

  const payload = (await response.json()) as LayoutApiResponse
  return {
    layout: normalizeSharedLayout(payload.layout),
    updatedAt: payload.updatedAt,
  }
}

export const saveSharedLayout = async (layout: SharedLayoutState): Promise<LayoutSaveResponse> => {
  return putLayoutPayload({ layout })
}

export const saveViewLayout = async (viewId: LayoutViewId, viewLayout: ViewLayoutState): Promise<LayoutSaveResponse> => {
  return putLayoutPayload({ viewId, viewLayout })
}

const putLayoutPayload = async (requestPayload: unknown): Promise<LayoutSaveResponse> => {
  const response = await fetch(LAYOUT_ENDPOINT, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(requestPayload),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? `Layout save failed: ${response.status}`)
  }

  const responsePayload = (await response.json()) as LayoutSaveResponse
  return {
    ok: true,
    layout: normalizeSharedLayout(responsePayload.layout),
    updatedAt: responsePayload.updatedAt,
  }
}

export const getFallbackSharedLayout = () => createEmptySharedLayout()
