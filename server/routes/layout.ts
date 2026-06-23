import { getSharedLayout, saveSharedLayout, type LayoutStoreEnv } from '../layoutStore'
import {
  LayoutValidationError,
  assertLayoutPayloadSize,
  parseSharedLayoutPayload,
  parseViewLayoutPayload,
} from '../../src/layout/validation'

export const handleLayoutRequest = async (request: Request, env: LayoutStoreEnv): Promise<Response> => {
  if (request.method === 'GET') {
    return handleGet(env)
  }

  if (request.method === 'PUT') {
    return handlePut(request, env)
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET, PUT' } })
}

const handleGet = async (env: LayoutStoreEnv) => {
  try {
    const record = await getSharedLayout(env)
    return Response.json({ layout: record.layout, updatedAt: record.updatedAt })
  } catch (error) {
    return routeError(error)
  }
}

const handlePut = async (request: Request, env: LayoutStoreEnv) => {
  try {
    const rawPayload = await request.text()
    assertLayoutPayloadSize(rawPayload)

    const payload = JSON.parse(rawPayload)
    const layout = await getLayoutFromPayload(payload, env)
    const record = await saveSharedLayout(env, layout)

    return Response.json({ ok: true, layout: record.layout, updatedAt: record.updatedAt })
  } catch (error) {
    return routeError(error)
  }
}

const getLayoutFromPayload = async (payload: unknown, env: LayoutStoreEnv) => {
  if (isRecord(payload) && 'viewId' in payload) {
    const { viewId, viewLayout } = parseViewLayoutPayload(payload)
    const current = await getSharedLayout(env)

    return {
      ...current.layout,
      [viewId]: viewLayout,
    }
  }

  return parseSharedLayoutPayload(payload)
}

const routeError = (error: unknown) => {
  if (error instanceof SyntaxError || error instanceof LayoutValidationError) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  const message = error instanceof Error ? error.message : 'Unexpected error'
  const status = message.includes('D1 binding') ? 503 : 500
  return Response.json({ error: message }, { status })
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
