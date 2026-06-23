import { sharedLayoutStateSchema } from '../db/schema'
import { createEmptySharedLayout, type SharedLayoutState } from '../src/types/layout'
import { normalizeSharedLayout } from '../src/layout/validation'

const CURRENT_LAYOUT_ID = 'current'

export interface LayoutRecord {
  layout: SharedLayoutState
  updatedAt: string | null
}

export interface LayoutStoreEnv {
  DB?: D1Database
}

interface SharedLayoutRow {
  layout_json: string
  updated_at: string
}

export const getSharedLayout = async (env: LayoutStoreEnv): Promise<LayoutRecord> => {
  const db = getDb(env)
  await ensureLayoutTable(db)

  const row = await db
    .prepare('SELECT layout_json, updated_at FROM shared_layout_state WHERE id = ?')
    .bind(CURRENT_LAYOUT_ID)
    .first<SharedLayoutRow>()

  if (!row) {
    return { layout: createEmptySharedLayout(), updatedAt: null }
  }

  return {
    layout: normalizeSharedLayout(JSON.parse(row.layout_json)),
    updatedAt: row.updated_at,
  }
}

export const saveSharedLayout = async (env: LayoutStoreEnv, layout: SharedLayoutState): Promise<LayoutRecord> => {
  const db = getDb(env)
  await ensureLayoutTable(db)

  const updatedAt = new Date().toISOString()
  await db
    .prepare(
      `INSERT INTO shared_layout_state (id, layout_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         layout_json = excluded.layout_json,
         updated_at = excluded.updated_at`,
    )
    .bind(CURRENT_LAYOUT_ID, JSON.stringify(layout), updatedAt)
    .run()

  return { layout, updatedAt }
}

const ensureLayoutTable = async (db: D1Database) => {
  await db.prepare(sharedLayoutStateSchema.trim()).run()
}

const getDb = (env: LayoutStoreEnv) => {
  if (!env.DB) {
    throw new Error('Cloudflare D1 binding `DB` is unavailable. Set `.openai/hosting.json` d1 to `DB`.')
  }

  return env.DB
}
