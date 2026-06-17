# Data Center Relationships Visualizer - Phased Plan

## Summary

| Step | Phase | Primary Outcome | QA Check |
| ---: | --- | --- | --- |
| 1 | Project scaffold | React + TypeScript app shell is ready | App starts locally without build errors |
| 2 | Core structure | Recommended folder layout exists | Source tree matches planned architecture |
| 3 | Data model | Canonical objects, relationships, and views are centralized | Dataset type-checks and has no broken references |
| 4 | Graph builder | Active view converts source data into React Flow nodes and edges | Each view renders only its intended relationship type |
| 5 | Layouts | Facility, Power, and Thermal layouts are view-specific | Nodes are visible, spaced, and readable in all views |
| 6 | App shell | Full-screen header, sidebar, and canvas are assembled | Layout works at desktop and narrow widths |
| 7 | Controls | View switching, search dimming, and type filters work | Filter/search combinations produce expected graph states |
| 8 | Canvas behavior | Pan, zoom, fit, reset-all, collapsible minimap, selection, box selection, and node/group dragging are usable | Controls behave correctly after switching views |
| 9 | Prototype polish | Visual styling feels clean and presentation-friendly | No overlap, unreadable text, or distracting styling |
| 10 | Thermal loop refinement | Thermal Chain distinguishes facility/chiller loop, CDU secondary loop, cold supply, and warm return | Blue supply and red return edges are visually traceable |
| 11 | Smart relationship routing | Relationship lines reroute orthogonally, animate directionally, avoid objects, distribute shared-side anchors, and support session-only endpoint adjustment | Node moves, box selection moves, endpoint drags, colored animation, distributed anchors, and reset-all behavior work |

## 1. Project Scaffold

Create a Vite React + TypeScript application for the functional prototype. Install React Flow and the minimal styling/tooling dependencies needed for the viewer.

**QA check:** Run the dev server and confirm the initial app loads without console or terminal errors.

## 2. Core Structure

Create the structured folder layout from the spec:

```text
src/
  app/
  components/
  components/nodes/
  data/
  graph/
  types/
```

**QA check:** Confirm the source tree matches the planned architecture and that imports resolve cleanly.

## 3. Data Model

Add the shared TypeScript graph types, canonical object registry, relationship lists, and view configuration files. Keep the dataset editable and centralized.

**QA check:** Verify all relationship `source` and `target` IDs exist in the canonical object registry, and confirm the app type-checks.

## 4. Graph Builder

Implement `buildGraphForView` to filter objects and relationships by active view, relationship type, and search term. Search should dim non-matching nodes rather than removing them.

**QA check:** Confirm Facility renders only hierarchical edges, while Power Train and Thermal Chain render only directional edges.

## 5. View Layouts

Implement deterministic layouts:

- Facility: top-to-bottom tree
- Power Train: left-to-right single lane
- Thermal Chain: left-to-right liquid and air lanes

Render shared Thermal objects once per view for v1.

**QA check:** Switch through all three views and confirm all relevant nodes are visible, readable, and not stacked on top of each other.

## 6. App Shell

Build the full-screen interface with the title `Data Center Relationships Visualizer`, a left-side control panel, and a main React Flow canvas.

**QA check:** Confirm the app fills the viewport, the sidebar remains usable, and the canvas takes the remaining available space.

## 7. Controls

Add the v1 controls:

- Facility / Power Train / Thermal Chain view switcher
- Search box
- Legend
- Relationship visibility summary

**QA check:** Confirm view switching and search dimming work without stale graph state.

## 8. Canvas Behavior

Enable React Flow pan, zoom, fit-to-screen, reset-all behavior, a collapsible preview/minimap, node selection, drag-box multi-selection, in-memory node dragging, and selected-group dragging. Auto-fit the graph on view switch.

The fit button only adjusts the current viewport. The reset button restores default node positions, clears selected nodes, clears selected relationships, clears manual relationship anchors, and resets the viewport.

**QA check:** Confirm pan and zoom work, fit restores a useful viewport, reset clears session layout state, box selection can select multiple nodes, selected groups move together, preview collapse/expand works, and auto-fit runs after each view change.

## 9. Prototype Polish

Apply restrained diagramming-tool styling: plain white canvas, crisp rectangular nodes, clear typography, subtle borders, selected-node rings, selected-relationship anchor handles, hidden persistent node handles, and view-aware accent colors.

**QA check:** Inspect the app at common desktop and narrow viewport sizes for text overflow, awkward wrapping, visual overlap, and excessive decoration.

## 10. Thermal Loop Refinement

Refine the Thermal Chain model to distinguish cold water supply, warm water return, facility/chiller loop, CDU secondary loop, and air cooling. Remove leak/sensing channels from the active v1 graph.

**QA check:** Confirm the build passes and manually verify the v1 acceptance criteria: three views, centralized dataset, correct edge types, search, pan/zoom, fit/reset, draggable nodes, red/blue thermal semantics, and no persistence requirement.

## 11. Smart Relationship Routing

Replace default relationship paths with smart orthogonal routing across all views. Routes should minimize right-angle turns, avoid crossing through object rectangles, intersect object boundaries at right angles, and recalculate after single-node or group movement. Directional relationships should show a colored animated flow overlay that matches the relationship color, including blue cold water supply, red warm water return, and teal air flow.

Selecting a relationship line should expose exactly two endpoint controls. Users may drag each endpoint to another point on the same object's boundary rectangle without reconnecting it to a different object. Persistent node connection handles should remain hidden. When multiple relationships anchor to the same side of an object, default anchor positions should distribute evenly along that side; manual endpoint drags override automatic spacing for that endpoint during the current session.

**QA check:** Confirm clicked relationships show editable handles only after selection, endpoint handles drag along the same object boundary, moved nodes reroute connected relationships, group moves preserve readable relationships, directional animation uses the relationship color, thermal red/blue/teal flows are visible, shared-side endpoints are distributed, and reset clears moved node positions and manual anchors.
