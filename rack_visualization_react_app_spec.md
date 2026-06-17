# Interactive Data Center Concept Map — Product Spec

## 1. Purpose
Create a single-page, full-screen interactive React application for concept communication. The app visually presents a shared set of data center objects across multiple conceptual views:

- **Facility** — physical containment and location hierarchy
- **Power Train** — electrical distribution and dependency flow
- **Thermal Chain** — cooling and heat-removal flow, with separate air and liquid lanes

The application is a lightweight **diagramming viewer** in the first version. Users may select and reposition nodes in memory during a session, but the app does not persist edits or provide full diagram editing.

---

## 2. Goals

### Primary goals
- Show a complete set of relevant objects for the selected view.
- Display relationships between objects as connected labeled boxes.
- Allow objects to belong to more than one view.
- Make the model extensible so additional views, objects, and relationships can be added later.
- Provide a clean, presentation-friendly interface for internal concept communication.

### Non-goals for v1
- Editing nodes or edges
- Persisting layout changes or view state
- Inline object editing
- Collaboration or multi-user features
- Backend/database integration

---

## 3. Core UX

## Layout
The app is full screen and contains:

1. **Header / title bar**
   - App title
   - Optional short subtitle showing current view

2. **Left-side control panel**
   - Single-select view buttons:
     - Facility
     - Power Train
     - Thermal Chain
   - Search box
   - Legend
   - Relationship visibility summary
   - Optional selected-object info area for future use

3. **Main canvas area**
   - React Flow graph canvas
   - Pan, zoom, fit-to-screen, and reset-view interactions enabled
   - Object selection and temporary drag repositioning enabled

---

## 4. View Definitions

## 4.1 Facility View
**Intent:** show physical containment / spatial hierarchy.

**Relationship type shown:**
- Hierarchical only

**Suggested layout:**
- Top-to-bottom tree

**Representative hierarchy:**
- Facility
- Lab / Data Hall
- Zone / Pod
- Hot Aisle Containment
- Aisle
- Row
- Rack
- Rack Unit / Chassis
- Server Tray / Server Node
- GPU

## 4.2 Power Train View
**Intent:** show directional electrical path and dependencies.

**Relationship type shown:**
- Directional only

**Suggested layout:**
- Left-to-right flow

**Representative path:**
- Utility / Generator (optional future)
- UPS / Switchgear (optional future)
- Remote Power Panel (RPP)
- Circuit Breaker
- Rack Power Distribution Unit (Rack PDU)
- Power Supply Unit (PSU)
- Server Tray / Server Node
- GPU
- CDU (for control/power dependency only, if included in dataset)

## 4.3 Thermal Chain View
**Intent:** show directional heat-removal mechanisms.

**Relationship type shown:**
- Directional only

**Suggested layout:**
- Left-to-right multi-lane flow

**Lanes / loops:**
- Facility / chiller water loop
- CDU secondary water loop
- Air cooling lane

**Thermal chain notes:**
- Thermal view should support shared objects across lanes where relevant.
- CDU may appear in both Facility and Thermal views.
- Rack and Server Tray / Node may appear in both air and liquid paths as shared assets.
- Cold water supply is represented by blue directional edges.
- Warm water return is represented by red directional edges.
- Leak detection and sensing channels are excluded from the active v1 dataset.

---

## 5. Visual Rules

## Nodes
- All objects render as labeled rectangular boxes.
- Node label is the primary visible text.
- Optional subtitle/type may appear in smaller text.
- Nodes may be color-coded by type or remain neutral in v1.

## Edges
- **Hierarchy edges**
  - Neutral color
  - Solid line
  - No arrowhead

- **Directional edges**
  - Colored line
  - Arrowhead required
  - Colors can vary by view:
    - Power Train: amber/gold
    - Thermal Chain cold water supply: blue
    - Thermal Chain warm water return: red
    - Thermal Chain (air): cool gray or teal

## View behavior
- Only edges relevant to the selected view are rendered.
- Objects may be reused across views but can be positioned differently per view.
- Layouts do not need to preserve cross-view coordinates.

---

## 6. Interaction Model

## Required in v1
- Switch between view states using left panel buttons
- Pan canvas
- Zoom canvas
- Fit graph to viewport
- Reset viewport
- Search for objects by label
- Select and drag nodes to reposition them temporarily

## Explicitly not required in v1
- Clicking a node to open details
- Editing or dragging nodes permanently
- Creating/deleting objects
- Saving user state

## Optional low-cost v1 enhancements
- Hover highlight on node and connected edges
- Mini-map
- Background grid
- Auto-fit on view switch

---

## 7. Information Architecture / Data Model

Use a **single canonical object registry**. Each object exists once and can participate in multiple views.

Data should be easy to edit in one place.

Recommended structure:

- `objects.ts` — canonical object list
- `relationships.ts` — edges by type and view
- `views.ts` — view definitions, layout hints, filters, legends
- `graphBuilders.ts` — transforms canonical data into React Flow nodes/edges for a selected view

### Object shape
```ts
export type ViewId = 'facility' | 'power' | 'thermal';
export type ObjectType =
  | 'facility'
  | 'space'
  | 'containment'
  | 'layout'
  | 'rack'
  | 'compute'
  | 'power'
  | 'thermal'
  | 'controls';

export interface GraphObject {
  id: string;
  label: string;
  type: ObjectType;
  description?: string;
  views: ViewId[];
  tags?: string[];
}
```

### Relationship shape
```ts
export type RelationshipType = 'hierarchical' | 'directional';

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  views: ViewId[];
  lane?: 'liquid' | 'air' | 'power';
  thermalFlow?: 'coldSupply' | 'warmReturn' | 'air' | 'control';
  loop?: 'facility' | 'cdu-secondary' | 'air' | 'power';
  label?: string;
}
```

### View config shape
```ts
export interface ViewConfig {
  id: ViewId;
  label: string;
  relationshipType: RelationshipType;
  layout: 'tree-vertical' | 'flow-horizontal' | 'multi-lane-horizontal';
  lanes?: Array<{ id: string; label: string }>;
}
```

---

## 8. Initial Dataset

This section should be kept highly editable and centralized.

## 8.1 Canonical Objects
```ts
export const OBJECTS: GraphObject[] = [
  // Facility / spatial hierarchy
  { id: 'facility', label: 'Facility', type: 'facility', views: ['facility'] },
  { id: 'lab', label: 'Lab / Data Hall', type: 'space', views: ['facility'] },
  { id: 'zone', label: 'Zone / Pod', type: 'space', views: ['facility'] },
  { id: 'hac', label: 'Hot Aisle Containment', type: 'containment', views: ['facility', 'thermal'] },
  { id: 'aisle', label: 'Aisle', type: 'layout', views: ['facility', 'thermal'] },
  { id: 'row', label: 'Row', type: 'layout', views: ['facility', 'power', 'thermal'] },
  { id: 'rack', label: 'Rack', type: 'rack', views: ['facility', 'power', 'thermal'] },
  { id: 'chassis', label: 'Rack Unit / Chassis', type: 'compute', views: ['facility'] },
  { id: 'serverNode', label: 'Server Tray / Server Node', type: 'compute', views: ['facility', 'power', 'thermal'] },
  { id: 'gpu', label: 'GPU', type: 'compute', views: ['facility', 'power', 'thermal'] },

  // Power train
  { id: 'rpp', label: 'Remote Power Panel', type: 'power', views: ['power'] },
  { id: 'breaker', label: 'Circuit Breaker', type: 'power', views: ['power'] },
  { id: 'rackPdu', label: 'Rack PDU', type: 'power', views: ['power'] },
  { id: 'psu', label: 'Power Supply Unit', type: 'power', views: ['power'] },
  { id: 'plc', label: 'PLC / Controls', type: 'controls', views: ['power', 'thermal'] },

  // Thermal chain - liquid
  { id: 'chillerPlant', label: 'Chiller / Cooling Plant', type: 'thermal', views: ['thermal'] },
  { id: 'facilitySupplyHeader', label: 'Facility Supply Header', type: 'thermal', views: ['thermal'] },
  { id: 'facilityReturnHeader', label: 'Facility Return Header', type: 'thermal', views: ['thermal'] },
  { id: 'cdu', label: 'CDU', type: 'thermal', views: ['facility', 'power', 'thermal'] },
  { id: 'overheadSupply', label: 'Overhead Supply Header', type: 'thermal', views: ['thermal'] },
  { id: 'rowBranchSupply', label: 'Row / Branch Supply', type: 'thermal', views: ['thermal'] },
  { id: 'rackSupplyManifold', label: 'Rack Supply Manifold', type: 'thermal', views: ['thermal'] },
  { id: 'quickDisconnect', label: 'Quick Disconnects', type: 'thermal', views: ['thermal'] },
  { id: 'coldPlate', label: 'Cold Plate', type: 'thermal', views: ['thermal'] },
  { id: 'serverReturn', label: 'Server Tray Return', type: 'thermal', views: ['thermal'] },
  { id: 'rackReturnManifold', label: 'Rack Return Manifold', type: 'thermal', views: ['thermal'] },
  { id: 'rowBranchReturn', label: 'Row / Branch Return', type: 'thermal', views: ['thermal'] },
  { id: 'overheadReturn', label: 'Overhead Return Header', type: 'thermal', views: ['thermal'] },

  // Thermal chain - air
  { id: 'coldAisleAir', label: 'Cold Aisle Supply Air', type: 'thermal', views: ['thermal'] },
  { id: 'serverFans', label: 'Server Fans', type: 'thermal', views: ['thermal'] },
  { id: 'residualHeat', label: 'Residual Component Heat', type: 'thermal', views: ['thermal'] },
  { id: 'hotAisleAir', label: 'Hot Aisle / Exhaust Air', type: 'thermal', views: ['thermal'] },
  { id: 'crah', label: 'CRAH / CRAC', type: 'thermal', views: ['thermal'] }
];
```

## 8.2 Facility Relationships
```ts
export const FACILITY_RELATIONSHIPS: GraphRelationship[] = [
  { id: 'f1', source: 'facility', target: 'lab', type: 'hierarchical', views: ['facility'] },
  { id: 'f2', source: 'lab', target: 'zone', type: 'hierarchical', views: ['facility'] },
  { id: 'f3', source: 'zone', target: 'hac', type: 'hierarchical', views: ['facility'] },
  { id: 'f4', source: 'hac', target: 'aisle', type: 'hierarchical', views: ['facility'] },
  { id: 'f5', source: 'aisle', target: 'row', type: 'hierarchical', views: ['facility'] },
  { id: 'f6', source: 'row', target: 'rack', type: 'hierarchical', views: ['facility'] },
  { id: 'f7', source: 'rack', target: 'chassis', type: 'hierarchical', views: ['facility'] },
  { id: 'f8', source: 'chassis', target: 'serverNode', type: 'hierarchical', views: ['facility'] },
  { id: 'f9', source: 'serverNode', target: 'gpu', type: 'hierarchical', views: ['facility'] },

  // Optional spatial placement references for cross-view assets
  { id: 'f10', source: 'lab', target: 'cdu', type: 'hierarchical', views: ['facility'] }
];
```

## 8.3 Power Relationships
```ts
export const POWER_RELATIONSHIPS: GraphRelationship[] = [
  { id: 'p1', source: 'rpp', target: 'breaker', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p2', source: 'breaker', target: 'rackPdu', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p3', source: 'rackPdu', target: 'psu', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p4', source: 'psu', target: 'serverNode', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p5', source: 'serverNode', target: 'gpu', type: 'directional', views: ['power'], lane: 'power' },

  // Optional control dependency references
  { id: 'p6', source: 'breaker', target: 'plc', type: 'directional', views: ['power'], lane: 'power', label: 'monitor/control' },
  { id: 'p7', source: 'plc', target: 'cdu', type: 'directional', views: ['power'], lane: 'power', label: 'power/control dependency' }
];
```

## 8.4 Thermal Relationships
```ts
export const THERMAL_RELATIONSHIPS: GraphRelationship[] = [
  // Facility / chiller loop
  { id: 't1', source: 'chillerPlant', target: 'facilitySupplyHeader', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'facility' },
  { id: 't2', source: 'facilitySupplyHeader', target: 'cdu', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'facility' },
  { id: 't3', source: 'cdu', target: 'facilityReturnHeader', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'facility' },
  { id: 't4', source: 'facilityReturnHeader', target: 'chillerPlant', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'facility' },

  // CDU secondary loop - cold supply
  { id: 't5', source: 'cdu', target: 'overheadSupply', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't6', source: 'overheadSupply', target: 'rowBranchSupply', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't7', source: 'rowBranchSupply', target: 'rackSupplyManifold', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't8', source: 'rackSupplyManifold', target: 'quickDisconnect', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't9', source: 'quickDisconnect', target: 'serverNode', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't10', source: 'serverNode', target: 'coldPlate', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },

  // CDU secondary loop - warm return
  { id: 't11', source: 'coldPlate', target: 'serverReturn', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't12', source: 'serverReturn', target: 'rackReturnManifold', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't13', source: 'rackReturnManifold', target: 'rowBranchReturn', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't14', source: 'rowBranchReturn', target: 'overheadReturn', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't15', source: 'overheadReturn', target: 'cdu', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },

  // Air lane
  { id: 't16', source: 'crah', target: 'coldAisleAir', type: 'directional', views: ['thermal'], lane: 'air' },
  { id: 't17', source: 'coldAisleAir', target: 'rack', type: 'directional', views: ['thermal'], lane: 'air' },
  { id: 't18', source: 'rack', target: 'serverFans', type: 'directional', views: ['thermal'], lane: 'air' },
  { id: 't19', source: 'serverFans', target: 'residualHeat', type: 'directional', views: ['thermal'], lane: 'air' },
  { id: 't20', source: 'residualHeat', target: 'hotAisleAir', type: 'directional', views: ['thermal'], lane: 'air' },
  { id: 't21', source: 'hotAisleAir', target: 'hac', type: 'directional', views: ['thermal'], lane: 'air' },
  { id: 't22', source: 'hac', target: 'crah', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' }
];
```

---

## 9. View Configurations
```ts
export const VIEW_CONFIGS: ViewConfig[] = [
  {
    id: 'facility',
    label: 'Facility',
    relationshipType: 'hierarchical',
    layout: 'tree-vertical'
  },
  {
    id: 'power',
    label: 'Power Train',
    relationshipType: 'directional',
    layout: 'flow-horizontal',
    lanes: [{ id: 'power', label: 'Power Flow' }]
  },
  {
    id: 'thermal',
    label: 'Thermal Chain',
    relationshipType: 'directional',
    layout: 'multi-lane-horizontal',
    lanes: [
      { id: 'liquid', label: 'Liquid Cooling' },
      { id: 'air', label: 'Air Cooling' }
    ]
  }
];
```

---

## 10. Layout Behavior

## Facility layout
- Top-down tree
- Center root node at top
- Children distributed beneath each parent
- Consistent vertical spacing

## Power layout
- Single horizontal lane
- Ordered left-to-right
- Even node spacing

## Thermal layout
- Multiple horizontal regions:
  - facility/chiller loop
  - CDU secondary cold supply and warm return loop
  - air cooling lane
- Shared objects may either:
  - appear once in a neutral shared region, or
  - be duplicated visually per lane while retaining the same source object id in data mapping logic

**Recommendation for v1:**
Render shared objects once per view for simplicity unless lane readability suffers.

---

## 11. React Architecture Recommendation

## Suggested stack
- React
- TypeScript
- React Flow
- Tailwind CSS (optional, recommended)

## Suggested file structure
```text
src/
  app/
    App.tsx
  components/
    Header.tsx
    Sidebar.tsx
    ViewSwitcher.tsx
    SearchBox.tsx
    Legend.tsx
    GraphCanvas.tsx
    nodes/
      DefaultNode.tsx
  data/
    objects.ts
    relationships.ts
    views.ts
  graph/
    buildGraphForView.ts
    layoutFacility.ts
    layoutPower.ts
    layoutThermal.ts
    edgeStyles.ts
    nodeStyles.ts
  types/
    graph.ts
```

## Main application state
```ts
interface AppState {
  activeView: 'facility' | 'power' | 'thermal';
  searchTerm: string;
  // Node drag positions are held by React Flow for the current session only.
}
```

---

## 12. Rendering Logic

### Graph build pipeline
1. Read active view config
2. Filter canonical objects by selected view
3. Filter relationships by selected view and relationship type
4. Apply search dimming
5. Transform objects into React Flow nodes
6. Transform relationships into React Flow edges
7. Run layout function for selected view
8. Render graph and auto-fit

### Important rule
For Facility, render **only hierarchical** edges. For Power and Thermal, render **only directional** edges.

---

## 13. Search and Filtering Behavior

## Search
- Searches node labels only in v1
- Matching nodes remain highlighted or exclusively shown depending on desired simplicity

**Recommendation for v1:**
Dim non-matching nodes rather than removing them

## Object filters
Object type filters are excluded from the current prototype to keep the left panel focused on view switching, search, legend, and relationship summary.

---

## 14. Styling Guidance

Visual tone should feel like a **diagramming tool**:
- clean white or light neutral background
- plain white canvas background
- restrained color usage
- crisp boxes with medium-radius corners
- clear typography
- no heavy skeuomorphic effects

### Suggested palette
- Background: off-white / very light gray
- Panel: white with subtle border
- Facility accents: slate / neutral
- Power accents: amber / gold
- Thermal cold water supply accents: blue
- Thermal warm water return accents: red
- Thermal air accents: teal or gray
- Controls accents: muted purple or steel blue

---

## 15. Acceptance Criteria for v1

- App renders full screen with header, left panel, and graph canvas.
- User can switch among Facility, Power Train, and Thermal Chain.
- Each view shows the complete object set relevant to that view.
- Facility view renders hierarchical edges only.
- Power Train view renders directional edges only.
- Thermal Chain view renders directional edges only and separates air and liquid lanes.
- Objects shared across views are sourced from one canonical dataset.
- Search dimming works on the current view.
- Pan, zoom, fit, and reset interactions work.
- Nodes can be selected and dragged temporarily.
- Layout resets on reload; no persistence required.
- Dataset is centralized in editable source files.

---

## 16. Recommended Next Step
After approval of this spec, build a **single-file React prototype** first using hardcoded data from the structures above, then optionally refactor into the recommended file structure once the content model stabilizes.

---

## 17. Open Design Decisions for Later
- Whether shared nodes in Thermal should render once or per lane
- Whether facility loop should later expose more plant-side components such as condenser water, cooling towers, pumps, or economizers
- Whether clicking a node should open object details in the sidebar
- Whether Facility should later include auxiliary systems like CDU, CRAH, sensors, and piping spatially
- Whether Power Train should include utility, generator, UPS, and switchgear in the initial model
