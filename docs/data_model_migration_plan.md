# Data Model Migration Plan

## Summary

This plan evaluates `docs/thermal_chain_power_train_asset_relationship_model.md` against the React Flow implementation and tracks the staged migration toward an interactive, editable, exportable data model.

## Implementation Steps And QA Checks

| Step | Phase | Implementation Outcome | QA Check |
| ---: | --- | --- | --- |
| 1 | Canonical model types | Complete: typed views, groups, assets, relationships, enums, and validation result types added | Passed: TypeScript build covers the model types |
| 2 | Markdown source parser | Complete: parser reads `docs/thermal_chain_power_train_asset_relationship_model.md` into canonical model data | Passed: parser returns 3 views, 20 groups, 72 assets, and 89 relationships |
| 3 | Model validation | Complete: validates IDs, references, enum values, view memberships, and group references | Passed with 0 errors and 1 warning |
| 4 | Image resolver | Complete: asset image support preserved with exact/alias lookup and blank fallback for missing images | Passed in browser smoke test; no broken-image runtime errors observed |
| 5 | Graph adapter | Complete: canonical model data converts to React Flow nodes, edges, view configs, and sidebar data | Passed: all three views render from canonical data |
| 6 | View ID migration | Complete: adopted `facility`, `thermal_chain`, and `power_train` throughout app state and layout persistence | Passed: view switching works and layout save works with `thermal_chain` |
| 7 | Styling migration | Complete: edge color/dash use relationship subtype, medium, flow role, and temperature state | Passed: build/lint and visual smoke tests pass |
| 8 | Layout migration | Complete for first pass: group metadata drives generic visual placement | Passed: all views render; follow-up polish expected for dense views |
| 9 | Legacy data removal | Complete for runtime: legacy `src/data` exports now derive from canonical model adapter | Passed: app renders with the full proposed model counts |
| 10 | Shared editing model | Pending: prepare editing state as one shared editable model with no user permissions | QA pending with future editing UI implementation |
| 11 | Regression QA | Complete for migration pass: build, lint, model validation, browser smoke tests, and layout save test | Passed: `npm run build`, `npm run lint`, `npm run model:validate`, all-view smoke test, and save interaction test |

The proposal is a strong direction. It moves the app from a diagram-specific graph dataset into a more durable domain model:

- canonical assets shared across views
- view registry
- group and lane registry
- richer relationship semantics
- relationship-driven visual encoding
- seed content for facility, thermal, and power views

The first migration pass is complete: the app now parses the Markdown model, validates it, adapts it into React Flow graph data, and renders the full canonical asset/relationship set. The remaining challenge is turning that canonical model into an editable shared model with D1 persistence.

## Migration Decisions

Decisions captured after review:

- Replace the current app assets and relationships with the full proposed model.
- Adopt the proposal's snake_case canonical IDs.
- Leave existing saved D1 layout positions behind; no layout ID migration is required.
- Rename/adopt the proposal's view IDs, including `thermal_chain` and `power_train`.
- Keep the Markdown spec as the source for now.
- Retain the ability for assets to have associated images.
- Leave assets image-less when no matching image exists.
- Include the full proposed model, including controls, telemetry, backup power, sensors, and expanded thermal/power assets.
- Do not preserve the current layout.
- Keep Hot Aisle Containment as an asset.
- Store relationship notes for export only; do not show them as default edge labels.
- Use one shared model.
- All users can edit; there is no permissions or ownership model.
- Treat groups as visual-only for now.
- Defer export.
- Defer import.
- Treat the simplified power redundancy model as sufficient for v1.

## Current Implementation

Current source data lives in:

- `docs/thermal_chain_power_train_asset_relationship_model.md`
- `src/model/source/parseMarkdownModel.ts`
- `src/model/source/markdownModel.ts`
- `src/model/validation.ts`
- `src/model/toGraph.ts`

Compatibility exports still live in:

- `src/data/objects.ts`
- `src/data/relationships.ts`
- `src/data/views.ts`

Current dataset size:

- 3 views
- 20 groups
- 72 assets
- 89 relationships
- 0 validation errors
- 1 validation warning: `pt_ctrl_009` references `server_fans` in `power_train`, while `server_fans` is declared visible only in `thermal_chain`

Current view IDs:

```text
facility
thermal_chain
power_train
```

Current object model:

```ts
interface GraphObject {
  id: string
  label: string
  type: ObjectType
  description?: string
  views: ViewId[]
  defaultGroups?: Partial<Record<ViewId, string>>
  tags?: string[]
}
```

Current relationship model:

```ts
interface GraphRelationship {
  id: string
  source: string
  target: string
  type: 'hierarchical' | 'directional'
  views: ViewId[]
  lane?: string
  subtype?: RelationshipSubtype
  medium?: Medium
  flowRole?: FlowRole
  temperatureState?: TemperatureState
  directionSemantics?: string
  notes?: string
  label?: string
}
```

The current implementation is still render-first, but its render data now comes from the canonical Markdown model rather than hand-maintained graph arrays. It does not yet include model editing, import/export, or canonical model persistence in D1.

## Proposal Evaluation

The proposed model is well aligned with the product goal of letting users explore, edit, and export the data model.

Strong points:

- **Canonical asset IDs:** Shared assets are modeled once and attached to multiple views. This is the right base for editing and export.
- **Relationship semantics live on edges:** Medium, flow role, subtype, and temperature state belong on relationships. This matches the reality that assets like CDUs, headers, manifolds, and racks can participate in both supply and return paths.
- **Groups and lanes are first-class:** This creates a path to data-driven layout, swimlanes, background regions, and filtered editing.
- **Power and thermal are normalized under one pattern:** Both can use directional relationships with subtype, medium, role, and lane metadata.
- **Seed content is much richer:** The power train model especially expands beyond the current simple RPP-to-GPU chain.
- **Export readiness:** The proposed registry-style tables map cleanly to JSON, CSV, Markdown, and eventually D1 tables.

Risks and gaps:

- **Large dense views:** The full model renders many more nodes and edges than the original prototype, so layout polish remains important.
- **Markdown source brittleness:** Markdown is convenient for now but should fail loudly through validation because table edits can break parsing.
- **One current validation warning:** `pt_ctrl_009` links to `server_fans` from `power_train`, but `server_fans` is not declared in that view. The renderer includes relationship endpoints so the graph still renders.
- **Editing needs a validation model:** The spec lists fields but not all constraints needed for safe editing, such as required groups by view, delete behavior, duplicate prevention, and referential integrity rules.

## Recommended Target Model

Use the proposal as the canonical domain model, but introduce it behind a compatibility layer before replacing the rendering model.

Recommended TypeScript model:

```ts
type ModelViewId = 'facility' | 'thermal_chain' | 'power_train'

interface ModelView {
  id: ModelViewId
  name: string
  purpose: string
  primaryRelationshipTypes: RelationshipType[]
  layoutStyle: 'tree-vertical' | 'flow-horizontal' | 'multi-lane-horizontal'
}

interface ModelGroup {
  id: string
  viewId: ModelViewId
  label: string
  type: 'section' | 'lane' | 'zone'
  order: number
  parentGroupId?: string
  description?: string
}

interface ModelAsset {
  id: string
  label: string
  type: AssetType
  views: ModelViewId[]
  defaultGroups: Partial<Record<ModelViewId, string>>
  description?: string
}

interface ModelRelationship {
  id: string
  viewId: ModelViewId
  sourceAssetId: string
  targetAssetId: string
  type: 'hierarchical' | 'directional'
  subtype:
    | 'contains'
    | 'liquid_flow'
    | 'air_flow'
    | 'power_flow'
    | 'backup_power_flow'
    | 'control_signal'
    | 'telemetry_signal'
    | 'dependency'
  medium:
    | 'water'
    | 'coolant'
    | 'air'
    | 'electricity'
    | 'control_signal'
    | 'telemetry'
    | 'none'
  flowRole:
    | 'supply'
    | 'return'
    | 'feed'
    | 'backup_feed'
    | 'exhaust'
    | 'control'
    | 'telemetry'
    | 'dependency'
  temperatureState: 'cold' | 'warm' | 'hot' | 'neutral'
  groupId?: string
  directionSemantics?: string
  label?: string
  notes?: string
}
```

Keep a render adapter:

```text
canonical model -> buildGraphForView() adapter -> React Flow nodes/edges
```

This allows the visualizer to keep working while the domain model matures.

## Migration Path

### Phase 1: Preserve And Parse The Spec

Status: complete for the first migration pass.

Completed:

- Copied source spec into `docs/thermal_chain_power_train_asset_relationship_model.md`.
- Created this migration plan.
- Added a parser that converts Markdown tables into a typed in-memory model.
- Kept parsing isolated so the source can later move to TypeScript, JSON, or D1 without rewriting graph rendering.

Implemented files:

```text
src/model/source/parseMarkdownModel.ts
src/model/source/markdownModel.ts
```

Because Markdown tables are brittle, the parser should fail loudly on malformed rows and emit validation errors. Runtime graph rendering should consume the parsed canonical model, not parse Markdown directly inside React components.

### Phase 2: Add Canonical Model Types And Validation

Status: complete for the first migration pass.

Added:

```text
src/model/types.ts
src/model/validation.ts
scripts/validate_model.ts
```

Validation should check:

- asset IDs are unique
- view IDs are unique
- group IDs are unique and reference valid views
- relationship IDs are unique
- relationship source and target IDs exist
- relationship `viewId` is valid
- relationship endpoints are visible in the relationship's view
- relationship group/lane IDs exist in the same view
- default asset groups reference valid groups
- enum values are valid
- no orphan groups or unused critical assets unless explicitly allowed

Output a validation report suitable for the UI and CI:

```text
errors: blocks save/import
warnings: allowed but highlighted
info: useful model statistics
```

Current validation result:

```text
views: 3
groups: 20
assets: 72
relationships: 89
errors: 0
warnings: 1
```

Current warning:

```text
pt_ctrl_009: Target asset is not declared visible in power_train
```

### Phase 3: Build A Compatibility Adapter

Status: complete for the first migration pass.

Created an adapter that maps the canonical model to the existing graph renderer.

Implemented file:

```text
src/model/toGraph.ts
```

Mapping examples:

- `thermal_chain` -> app view `thermal_chain`
- `power_train` -> app view `power_train`
- `relationship.subtype = liquid_flow` and `flowRole = supply` -> blue liquid edge
- `relationship.subtype = liquid_flow` and `flowRole = return` -> red liquid edge
- `relationship.subtype = power_flow` -> amber power edge
- `relationship.subtype = backup_power_flow` -> dashed amber edge
- `relationship.subtype = telemetry_signal` -> thin telemetry edge
- `group.type = lane` -> current lane display or future swimlane rendering

This phase is complete for rendering. The adapter now feeds the compatibility exports in `src/data/*`.

### Phase 4: Migrate Seed Data

Status: complete for the first rendering migration pass.

The app now derives runtime graph data from the copied Markdown spec through the canonical parser and graph adapter. Legacy `src/data/*` files remain as compatibility export points, but their data is adapter-backed.

Compared rendered views:

- node count per view
- edge count per view
- missing images
- missing group assignments
- layout readability

Current rendered counts:

```text
Facility: 13 nodes, 12 edges
Thermal Chain: 45 nodes, 42 edges
Power Train: 42 nodes, 35 edges
```

Important ID decision:

The app will adopt the spec's snake_case IDs. Saved D1 layout state from the current app will not match the new IDs, and that is acceptable. No layout migration map is required.

### Phase 5: Data-Driven Layout And Visual Encoding

Status: first pass complete.

Layout behavior has moved from old ID-specific thermal/power layout functions toward group-aware placement.

Implemented:

- `layoutFacility` remains hierarchy-oriented.
- `layoutThermal` and `layoutPower` now delegate to generic group-based placement.
- Edge styling now derives from relationship subtype, medium, flow role, and temperature state.

Follow-up polish:

- Improve dense-view readability with more nuanced section/lane spacing.
- Consider dedicated helpers:

```text
layoutBySections()
layoutByLanes()
layoutHierarchy()
```

Visual encoding should be derived from relationship fields:

- `type`
- `subtype`
- `medium`
- `flowRole`
- `temperatureState`
- `groupId`

This will make styling predictable and editable.

### Phase 6: Editing UI

Introduce editing in layers rather than as one large admin tool.

V1 editing assumptions:

- There is one shared canonical model.
- Any user can edit the shared model.
- There is no permission model, ownership model, or per-user branch.
- Groups are visual placement metadata only.
- Export and import are deferred.

Recommended first editing surface:

- asset detail panel
- relationship detail panel
- add/edit/delete relationship
- validation feedback before save
- export current model

Then add:

- add/edit/delete asset
- assign asset to views
- assign default groups
- group/lane editing
- import model
- duplicate model/version

Editing principles:

- IDs should be stable and manually visible.
- Labels can change freely.
- Deleting an asset should require resolving dependent relationships.
- Relationship editing should use dropdowns sourced from valid assets, groups, subtypes, media, flow roles, and temperature states.
- Validation should run before save and before export.

### Phase 7: Persistence In D1

For editing, move canonical model data into D1. Keep layout state separate.

Suggested tables:

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

assets
- id
- model_version_id
- label
- type
- description

asset_views
- model_version_id
- asset_id
- view_id
- default_group_id

relationships
- id
- model_version_id
- view_id
- source_asset_id
- target_asset_id
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

Keep existing shared layout persistence separate:

```text
shared_layout_state
- id
- layout_json
- updated_at
```

This avoids coupling graph model editing to canvas layout saves.

### Phase 8: Export

Export is deferred. When it is added, support exports from the canonical model, not from React Flow state.

Recommended export formats:

- JSON canonical model
- CSV assets
- CSV relationships
- Markdown report matching the spec style
- Graph snapshot image or SVG/PDF later

Export should include:

- model metadata
- views
- groups
- assets
- relationships
- validation report
- optional saved layout positions

## Comparison Table

| Area | Current Implementation | Proposed Model | Migration Need |
| --- | --- | --- | --- |
| Views | `facility`, `thermal_chain`, `power_train` | `facility`, `thermal_chain`, `power_train` | Complete |
| Assets | Canonical Markdown assets adapted to graph objects | Canonical assets with default groups | Complete for rendering |
| Relationships | Canonical Markdown relationships adapted to graph edges | Typed semantic relationships | Complete for rendering |
| Groups/Lanes | Parsed visual metadata used by first-pass layout | First-class group/lane registry | Complete for first-pass layout |
| Styling | Based on relationship subtype, medium, flow role, and temperature state | Based on relationship semantics | Complete for first-pass styling |
| Layout | Generic group-based layout plus saved D1 overrides | Data-driven by groups/lanes | First pass complete; polish remains |
| Persistence | D1 shared layout only | Future model persistence in D1 | Add normalized model tables |
| Editing | None | Desired end state | Add validation and editor UI |
| Export | None | Desired end state | Export canonical model |

## Clarifying Questions

Resolved:

1. Adopt the spec's snake_case IDs as canonical.
2. Adopt `thermal_chain` and `power_train`.
3. Keep Markdown as the source for now.
4. Include the full proposed model.
5. Do not preserve current layout or current D1 saved positions.
6. Leave missing asset images blank for now.
7. Keep Hot Aisle Containment as an asset.
8. Store relationship notes for export only.

Still open:

1. Should layout positions eventually export with the model or separately as view state?
2. After v1, should power redundancy model independent A-side and B-side upstream lineups?
3. Which export format should come first when export is added: JSON, CSV, Markdown, image/PDF, or all of the above?

## Recommendation

Continue with the Markdown-backed canonical model and adapter. Do not move directly into D1 editing until the shared model editing surface and validation behavior are designed.

Completed:

- Define canonical model types.
- Parse the Markdown spec into the canonical model.
- Validate the parsed model.
- Adapt canonical data into the current React Flow renderer.
- Replace the runtime `src/data/*` source path with the canonical model adapter.
- Expand first-pass layout/styling to use group and relationship semantics.

Next:

- Design and implement shared editing.
- Move canonical model persistence into D1 with versioning.
- Add export later.

## Immediate Implementation Steps

Completed:

- Canonical model types and enum definitions.
- Markdown parser for the copied spec.
- Validation for parsed views, groups, assets, and relationships.
- Image resolver with exact/alias matches and missing-image fallback.
- Graph adapter that maps canonical model data to React Flow data.
- App view IDs migrated to:

```text
facility
thermal_chain
power_train
```

- Current `OBJECTS`, `RELATIONSHIPS`, and `VIEW_CONFIGS` runtime usage is adapter-backed.
- Edge styling uses relationship semantics.
- Validation and visual QA passed.

Next immediate step is shared model editing design and implementation.
