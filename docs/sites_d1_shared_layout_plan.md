# Sites + D1 Shared Layout Plan

## Summary

Status as of 2026-06-23:

- V1 shared layout persistence has been implemented locally.
- Source has been committed and pushed through commit `876cc18eff093cf450b8daf0eb984668e1fa1b3f`.
- Local build, lint, Worker API checks, and browser smoke tests passed.
- Production deployment is blocked because the Sites connector returned `Sites is not yet enabled for this workspace.`
- The graph model has since migrated to canonical view IDs: `facility`, `thermal_chain`, and `power_train`.

| Step | Phase | Outcome | QA Check |
| ---: | --- | --- | --- |
| 1 | Hosting readiness | App is prepared for Sites-compatible deployment | Root `npm run build` passes and app still runs locally |
| 2 | Sites metadata | Add `.openai/hosting.json` with a D1 binding | Hosting config exists and declares `DB` |
| 3 | Repo API and storage organization | Add the minimal Sites-compatible server/API structure | Route files, DB helper, schema, and migrations have clear homes |
| 4 | Shared layout schema | Add D1 schema for one global shared layout scoped by view | Migration creates the table cleanly |
| 5 | Layout API | Add API routes for loading and saving shared layout | API can read empty/default state and save updates |
| 6 | Client integration | App loads saved node and anchor positions from D1 | Refresh preserves the saved layout |
| 7 | Save UX | Add `Save current layout` button and save status feedback | Moving nodes/anchors marks layout dirty; saving clears dirty state |
| 8 | Reset behavior | Reset remains local until the user saves | Reset does not affect shared state until save is clicked |
| 9 | Last-save-wins | Store/update a single shared layout record | Latest save becomes the shared state |
| 10 | Sites deployment | Create Site, save version, and deploy production URL | Deployed Site loads, saves, refreshes, and shares state |
| 11 | Future DB migration | Document path for moving objects/relationships into D1 | Plan covers schema, admin editing, and validation strategy |

## Goals

- Host the Data Center Relationships Visualizer through ChatGPT Sites.
- Add D1-backed persistence for one global shared current layout.
- Scope saved layout data by graph view inside the global shared state.
- Keep canonical objects, relationships, and views in source code for v1.
- Persist only node positions and relationship anchor positions.
- Avoid automatic API spam by using an explicit `Save current layout` action.
- Use a simple last-save-wins conflict model for v1.

## Non-Goals For V1

- Per-user saved views.
- Authentication-specific layout ownership.
- Moving canonical object and relationship data into D1 immediately.
- Persisting UI-only state such as active view, search term, filters, selected nodes, selected relationships, or show-images preference.
- Adding R2 file storage.

## 1. Hosting Readiness

Confirm the root-level Vite app is ready for the Sites workstream.

Expected root layout:

```text
src/
public/
docs/
scripts/
package.json
vite.config.ts
```

**QA check:** Run `npm run build`, `npm run lint`, and `npm run dev` from the repo root.

## 2. Sites Metadata

Add Sites hosting metadata:

```text
.openai/hosting.json
```

Initial shape:

```json
{
  "d1": "DB",
  "r2": null
}
```

After the Site is created, persist the returned `project_id`:

```json
{
  "project_id": "returned-site-project-id",
  "d1": "DB",
  "r2": null
}
```

**QA check:** Confirm `.openai/hosting.json` exists, uses the logical D1 binding `DB`, and does not store secrets or runtime environment values.

## 3. Repo API And Storage Organization

Keep the current Vite React app structure and add the smallest Sites-compatible server/API layer needed for v1 persistence.

Rationale:

- The current app is a working client-side React Flow visualizer.
- V1 only needs two layout endpoints.
- A full app restructure would add risk before there is a larger server-rendered or admin workflow.
- The structure should still leave a clean path for future graph/admin APIs.

Expected organization:

```text
.openai/
  hosting.json
db/
  schema.ts
  migrations/
server/
  layoutStore.ts
  routes/
    layout.ts
src/
  ...
```

Responsibilities:

- `db/schema.ts` defines the D1 schema in source-controlled TypeScript.
- `db/migrations/` stores generated migration files.
- `server/layoutStore.ts` is the only application helper that reads/writes the raw `DB` binding for layout state.
- `server/routes/layout.ts` owns request parsing, response shaping, and validation for `/api/layout`.
- React components call `/api/layout`; they do not know about D1 directly.

Implementation note:

- Use prepared statements for D1 queries.
- Pass exactly one SQL statement to each `prepare()` call.
- Use separate prepared statements or `batch()` if multiple statements are needed.

**QA check:** Confirm the implementation has a clear route file, DB helper, schema file, and generated migration before client integration begins.

## 4. Shared Layout Schema

Use D1 to store a single global shared current layout record. Inside that record, store separate layout data for each graph view so overlapping node IDs do not cause the facility, power, and thermal layouts to overwrite each other.

```sql
CREATE TABLE IF NOT EXISTS shared_layout_state (
  id TEXT PRIMARY KEY,
  layout_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Use one row:

```text
id = "current"
```

Example `layout_json`:

```json
{
  "facility": {
    "nodePositions": {
      "facility": { "x": 120, "y": 80 },
      "lab_data_hall": { "x": 420, "y": 80 }
    },
    "edgeAnchors": {}
  },
  "thermal_chain": {
    "nodePositions": {},
    "edgeAnchors": {
      "tc_liq_005": {
        "source": { "side": "right", "offset": 0.4 },
        "target": { "side": "left", "offset": 0.6 }
      }
    }
  },
  "power_train": {
    "nodePositions": {},
    "edgeAnchors": {}
  }
}
```

**QA check:** Create the table locally or through the Sites/D1 migration workflow and verify an empty database returns a default layout response.

## 5. Layout API

Add a small server API for the shared state.

```text
GET /api/layout
PUT /api/layout
```

`GET /api/layout` returns:

```json
{
  "layout": {
    "facility": { "nodePositions": {}, "edgeAnchors": {} },
    "thermal_chain": { "nodePositions": {}, "edgeAnchors": {} },
    "power_train": { "nodePositions": {}, "edgeAnchors": {} }
  },
  "updatedAt": null
}
```

`PUT /api/layout` accepts:

```json
{
  "layout": {
    "facility": { "nodePositions": {}, "edgeAnchors": {} },
    "thermal_chain": { "nodePositions": {}, "edgeAnchors": {} },
    "power_train": { "nodePositions": {}, "edgeAnchors": {} }
  }
}
```

The API writes the single `current` row and updates `updated_at`.

Validation:

- Reject malformed JSON.
- Normalize known top-level view keys against `facility`, `thermal_chain`, and `power_train`; legacy/unknown view keys are ignored on read so old saved layouts do not block loading after model migrations.
- Validate each node position has finite numeric `x` and `y` values.
- Validate each anchor `side` is one of `top`, `right`, `bottom`, or `left`.
- Validate each anchor `offset` is a finite number from `0` to `1`.
- Validate each edge anchor only contains `source` and/or `target`.
- Validate payload size to avoid storing unexpectedly large client data.

For v1, the API validates shape but does not validate node and edge IDs against canonical source data. The client filters obsolete IDs when loading and saving because canonical graph data still lives in source files. When graph data moves to D1, move ID validation server-side.

**QA check:** Verify `GET` works before any save, `PUT` saves valid JSON payloads, and a following `GET` returns the saved state.

## 6. Client Integration

On app load, fetch the shared layout state and apply it to React Flow:

- apply saved node positions by node ID for the active view
- apply saved relationship anchors by edge ID for the active view
- ignore saved entries whose IDs no longer exist in source data
- fall back to default layout for missing node/edge IDs
- save only entries for known current graph nodes and edges
- keep API persistence hidden behind a small client helper rather than scattering `fetch('/api/layout')` through React components

**QA check:** Move a node, save, refresh, and confirm the node returns to the saved position.

## 7. Save UX

Add a `Save current layout` button near the existing Fit/Reset controls.

Use lightweight status feedback:

```text
Saved
Unsaved changes
Saving...
Save failed
```

Behavior:

- Moving a node marks the layout dirty.
- Dragging relationship anchors marks the layout dirty.
- Clicking `Save current layout` writes the current active view's node positions and edge anchors into the global shared layout state in D1.
- Successful save clears the dirty state.
- Failed save leaves dirty state visible.

**QA check:** Confirm unsaved state appears only after node/anchor changes, and that save status reflects success/failure.

## 8. Reset Behavior

Keep reset local by default.

Behavior:

- Clicking reset restores default node positions and default anchors locally.
- Reset does not write to D1 automatically.
- If the user resets and then clicks `Save current layout`, the reset/default layout becomes the shared state.

**QA check:** Save a custom layout, reset without saving, refresh, and confirm the custom saved layout returns. Then reset, save, refresh, and confirm the default layout returns.

## 9. Last-Save-Wins Handling

Use a simple last-save-wins model for v1.

Behavior:

- No locking.
- No merge UI.
- No per-user ownership.
- The latest successful `PUT /api/layout` overwrites the single shared row.
- If two users save different views at nearly the same time, the API should preserve other view payloads from the latest known database state where practical. If this is not practical in v1, document that the full global layout payload is last-save-wins.

Optional API response:

```json
{
  "ok": true,
  "updatedAt": "2026-06-17T23:00:00.000Z"
}
```

**QA check:** Save two different layouts from two browser sessions and confirm the latest save is what new sessions load.

## 10. Sites Deployment

Current deployment status:

- `.openai/hosting.json` exists with `d1` set to `DB` and `r2` set to `null`.
- Cloudflare Worker-compatible Vite build is configured with `wrangler.jsonc`, `worker/index.ts`, and the Cloudflare Vite plugin.
- D1 schema and migration files exist under `db/`.
- A canonical preview image exists at `public/screenshot.jpeg`.
- The deployable source state has been pushed to GitHub at commit `876cc18eff093cf450b8daf0eb984668e1fa1b3f`.
- Attempting to create the Site failed because Sites is not enabled for the current workspace.

Deployment flow:

```powershell
npm run build
git status
git add -A
git commit -m "Add Sites D1 shared layout persistence"
git push
```

Then use Sites to:

1. Create the Site with a shareable slug.
2. Persist returned `project_id` in `.openai/hosting.json`.
3. Save a Site version tied to the pushed commit SHA.
4. Deploy the saved version.
5. Test the production URL from a fresh browser session.

**QA check:** Open the deployed Site, move nodes/anchors, save, refresh, and confirm the shared state persists.

### Next Steps Once Sites Is Enabled

1. Re-run the Sites create flow.

   Requested site metadata:

   ```text
   slug: dcdt-relationships
   title: DCDT Relationships
   description: Interactive data center relationships visualizer with shared D1-backed layout persistence.
   ```

2. Persist the returned Site project ID in `.openai/hosting.json`.

   Expected shape:

   ```json
   {
     "project_id": "returned-site-project-id",
     "d1": "DB",
     "r2": null
   }
   ```

3. Commit and push the `.openai/hosting.json` update.

   Example:

   ```powershell
   git add .openai/hosting.json
   git commit -m "Persist Sites project id"
   git push
   ```

4. Run a fresh deployment build from the pushed source state.

   ```powershell
   npm run build
   ```

5. Save a Site version using the pushed commit SHA and build artifact.

   Artifact expectations:

   ```text
   dist/dcdt_relationships/index.js
   dist/dcdt_relationships/wrangler.json
   dist/client/**
   dist/.openai/hosting.json
   dist/.openai/migrations/**
   ```

6. Deploy the saved Site version to production.

7. Verify the production URL:

   - page loads from a fresh browser session
   - `GET /api/layout` returns default or saved layout state
   - moving a node marks the layout dirty
   - saving writes the active view's layout
   - refresh preserves saved positions
   - saving one view does not erase saved layouts for other views

## 11. Future Migration: Canonical Model In D1

The app now renders graph data from the canonical Markdown model in `docs/thermal_chain_power_train_asset_relationship_model.md`. When the model should become editable or database-managed, move that canonical model into normalized D1 tables while keeping layout state separate.

Potential schema:

```text
model_versions
- id
- name
- status
- created_at
- updated_at

views
- id
- model_version_id
- name
- purpose
- primary_relationship_types_json
- layout_style

groups
- id
- model_version_id
- view_id
- label
- type
- display_order
- parent_group_id
- description

objects
- id
- model_version_id
- label
- type
- description

object_views
- model_version_id
- object_id
- view_id
- default_group_id

relationships
- id
- model_version_id
- view_id
- source_object_id
- target_object_id
- type
- subtype
- medium
- flow_role
- temperature_state
- group_id
- direction_semantics
- label
- notes
```

The graph loading path would change from:

```text
Markdown model -> parser -> adapter -> buildGraphForView()
```

to:

```text
GET /api/graph?view=thermal_chain -> D1 query -> graph payload
```

Additional design work needed before this migration:

- admin editing UI
- validation for relationship source/target IDs
- image asset ownership and upload strategy
- seed migration from the Markdown model
- export strategy
- rollback/revision strategy for canonical graph data

**QA check:** Seed D1 from the Markdown model and confirm all three views render the same graph before and after migration.
