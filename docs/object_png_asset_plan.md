# Object PNG Asset Feature Plan

## Summary

| Step | Phase | Primary Outcome | QA Check |
| ---: | --- | --- | --- |
| 1 | Asset inventory | Every current graph object has a planned PNG asset filename | Object registry and asset manifest contain the same object IDs |
| 2 | Visual style guide | Equipment drawings share a consistent technical illustration style | Sample images match the supplied equipment-diagram reference |
| 3 | Asset generation | PNGs are generated for all current objects in one repo folder | All PNGs exist, load, and share the same aspect ratio |
| 4 | Asset manifest | Object IDs map to PNG paths in source data | Missing image paths fail a local validation check |
| 5 | Node rendering update | Nodes can render with or without object images | Toggle off matches current compact node layout |
| 6 | Sidebar toggle | A new Legend-area toggle controls image visibility | Toggle changes all graph nodes without changing data/layout state |
| 7 | Layout tuning | Image-enabled nodes remain readable and do not break smart routing | Images do not overlap labels, edges, or selected states |
| 8 | QA pass | Build, lint, asset validation, and browser visual QA pass | Facility, Power, and Thermal views work with images on/off |

## 1. Asset Inventory

Create a dedicated asset folder:

```text
public/object-images/
```

Use one PNG per canonical object ID:

```text
public/object-images/facility.png
public/object-images/lab.png
public/object-images/zone.png
...
```

Current object count: 33.

**QA check:** Validate that every `OBJECTS` entry has a corresponding PNG and every PNG maps back to a known object ID.

## 2. Visual Style Guide

Use the provided reference image as style direction for the equipment only:

- white or transparent background
- clean technical equipment drawing
- slight three-quarter/isometric feel where appropriate
- muted industrial grays with functional blue/red accents only where useful
- no arrows, step numbers, labels, captions, or title text inside the PNG
- consistent lighting, line weight, and rendering detail

For abstract spatial objects such as Facility, Lab / Data Hall, Zone / Pod, Aisle, Row, and Hot Aisle Containment, create simplified equipment-diagram-style spatial icons that still feel part of the same drawing set.

**QA check:** Review a small sample set before generating all assets.

## 3. Asset Generation

Generate PNG assets for every object. All assets should share the same aspect ratio so they render consistently inside nodes.

Implemented asset format:

- `1024 x 1024`
- 1:1 aspect ratio
- PNG
- transparent background

**QA check:** Confirm all generated files have identical pixel dimensions and are valid PNG files.

## 4. Asset Manifest

Add an image path field or manifest mapping by object ID. Recommended approach:

```ts
export const OBJECT_IMAGE_BY_ID: Record<string, string> = {
  facility: '/object-images/facility.png',
  lab: '/object-images/lab.png',
}
```

This keeps image lookup separate from the canonical object definitions and makes missing assets easy to validate.

**QA check:** Run a script that compares `OBJECTS.map(object => object.id)` against `OBJECT_IMAGE_BY_ID`.

## 5. Node Rendering Update

Update `DefaultNode` so image mode renders:

- object image at a stable size
- object label
- object type subtitle
- selected state ring
- search dimming
- hidden persistent React Flow handles

Keep non-image mode visually close to the current node design.

**QA check:** Verify text does not overflow and selected nodes remain visually obvious in both modes.

## 6. Sidebar Toggle

Add a toggle under `Legend`:

```text
Show object images
```

The toggle should be session-only and should not affect graph data, routing, search, selection, or relationship state.

**QA check:** Toggle images on/off in Facility, Power, and Thermal views without breaking node movement or edge routing.

## 7. Layout Tuning

Image-enabled nodes will likely need larger dimensions than current text-only nodes. Update layout spacing and smart-routing node rectangle measurements so edges avoid the larger visible cards.

Recommended behavior:

- image mode uses wider/taller nodes
- text-only mode keeps current compact nodes
- fit-to-view works after toggling image mode
- reset keeps current image mode but restores layout state

**QA check:** Check common dense areas such as Thermal Chain and Power Train for node overlap and readable relationship paths.

## 8. QA Pass

Run:

```powershell
npm run build
npm run lint
```

Also run an asset validation script and browser visual checks.

**QA check:** Confirm all three views render with images hidden and shown, relationship animation still works, selected-edge anchors still work, and reset still clears session layout state.

## Object Image Description Language

Use this shared style block for every generated asset:

```text
Create a high-detail cropped technical product illustration of the object. Style should match an engineering catalog or data center cooling system diagram: semi-realistic equipment drawing, crisp black linework, detailed industrial gray metal, visible panels, ports, fittings, bolts, seams, gauges, fans, screens, rails, valves, piping, and connectors where appropriate. Single object only, centered, isolated, transparent background, no arrows, no labels, no numbers, no captions, no watermark, no surrounding scene. Square 1024x1024 PNG. Fill most of the canvas with generous but not excessive padding.
```

| Object ID | Image Description |
| --- | --- |
| `facility` | A compact data center facility building module with raised-floor base, roofline, service panels, vents, glazing, utility penetrations, and subtle blue infrastructure accents. |
| `lab` | A data hall interior module with gridded floor/ceiling structure, bay divisions, overhead cable/cooling runs, and clean architectural technical detailing. |
| `zone` | A pod or zone enclosure shown as a segmented rectangular technical boundary with bay partitions, floor grid, and simple infrastructure pass-throughs. |
| `hac` | Hot aisle containment module with two facing rack rows, transparent containment canopy, end doors, roof panels, red exhaust plenum detail, and structural posts. |
| `aisle` | A data center aisle corridor drawn in perspective with floor lane markings, containment rails, overhead structure, and simple rack-adjacent boundaries. |
| `row` | A row of multiple server racks on a common floor rail with cable tray and shared infrastructure line, drawn as a compact equipment row. |
| `rack` | A detailed server rack cabinet with front rails, stacked server slots, blanking panels, visible handles, status lights, perforated panels, and side depth. |
| `chassis` | A rack-mounted chassis enclosure with multiple horizontal sled bays, metal rails, latches, ventilation perforations, status LEDs, and front handles. |
| `serverNode` | An open server tray or server node with motherboard, GPU modules, cold plate tubing, fans, heatsinks, power connectors, rails, and front handles. |
| `gpu` | A GPU accelerator card/module with black shroud, circuit board details, fan or heatsink geometry, connector edge, blue signal accents, and mounting bracket. |
| `rpp` | Remote power panel cabinet with breaker compartments, bus bars, hinged access panels, warning-color amber accents, conduit knockouts, and panel screws. |
| `breaker` | Circuit breaker assembly with stacked switch modules, toggle handles, bus connection detail, amber electrical accents, and molded housing. |
| `rackPdu` | Rack power distribution unit as a horizontal black strip with many receptacles, breaker buttons, status LEDs, mounting tabs, and power inlet detail. |
| `psu` | Power supply unit module with metal case, rear fan grille, connector block, latch, vent perforations, and amber power accent. |
| `plc` | PLC/controls cabinet with display screen, rows of indicator lights, terminal strips, small buttons, wiring channels, and gray enclosure panels. |
| `chillerPlant` | Chiller/cooling plant skid with compressor body, heat exchanger barrel, fan coils, piping headers, gauges, valves, and blue/red water connections. |
| `facilitySupplyHeader` | Facility supply header pair with prominent blue chilled-water pipe, secondary return pipe context, flanges, isolation valves, gauges, and wall brackets. |
| `facilityReturnHeader` | Facility return header pair with prominent red warm-water pipe, secondary supply pipe context, flanges, isolation valves, gauges, and wall brackets. |
| `cdu` | CDU cabinet with one open service bay exposing blue pump, red return pipe, blue supply pipe, brass valve wheel, fittings, gauges, heat exchanger, and a control panel with display and buttons. |
| `overheadSupply` | Overhead supply header rack with long blue coolant pipes on metal supports, hangers, branch taps, valves, clamps, and structural tray detail. |
| `rowBranchSupply` | Row/branch supply manifold with blue branch piping, several takeoff valves, support frame, small gauges, flexible connectors, and rack-row distribution detail. |
| `rackSupplyManifold` | Rack supply manifold with black horizontal body, multiple blue valve caps, hose barbs, threaded fittings, pressure ports, mounting brackets, and bolts. |
| `quickDisconnect` | Pair of stainless quick disconnect coolant couplings with knurled sleeves, locking collars, O-rings, machined grooves, and blue/red hose ends. |
| `coldPlate` | Copper cold plate assembly with microchannel grooves, screws, blue inlet, red outlet, gasket outline, machined surface detail, and chip contact area. |
| `serverReturn` | Server tray return module with open server sled, red return tubing, coolant outlet fittings, board detail, fans, heatsinks, and front rail handles. |
| `rackReturnManifold` | Rack return manifold with black horizontal body, multiple red valve caps, return ports, hose barbs, mounting brackets, and pressure/temperature ports. |
| `rowBranchReturn` | Row/branch return manifold with red return branch piping, collection valves, support frame, gauges, flexible connectors, and row-level return detail. |
| `overheadReturn` | Overhead return header rack with long red return pipes on metal supports, hangers, branch taps, valves, clamps, and structural tray detail. |
| `coldAisleAir` | Stylized cold aisle airflow equipment symbol with teal airflow streamlines, diffuser or floor-grille elements, and subtle mechanical duct detail. |
| `serverFans` | Cluster of server fan modules with circular housings, blades, motor hubs, grille rings, teal airflow accents, and mounting frame detail. |
| `residualHeat` | Residual component heat symbol with board/heatsink base, warm red/orange heat plumes, small component blocks, and technical thermal detail. |
| `hotAisleAir` | Stylized hot aisle exhaust airflow symbol with red streamlines, exhaust plume direction, grille/duct context, and simple thermal equipment detailing. |
| `crah` | CRAH/CRAC unit cabinet with front coil/filter panel, fan modules, vents, service doors, teal air/cooling accents, and industrial gray enclosure. |

## Clarifying Questions

1. Should each individual object get a unique PNG, or should objects of the same equipment family reuse a shared PNG? For example, should `overheadSupply` and `overheadReturn` share the same header image with blue/red accents, or be separate files?

2. Do you want transparent PNG backgrounds, or white PNG backgrounds that match the reference image?

3. Should images appear inside the existing rectangular nodes, or should image mode make the image itself the primary node visual with a small label underneath?

4. For abstract objects like Facility, Lab / Data Hall, Zone / Pod, Aisle, Row, and Hot Aisle Containment, should I create simplified spatial/architectural icons, or use neutral placeholder-style equipment drawings?

5. Should image mode be enabled by default, or should the app open in the current text-only mode with images hidden?

6. Should the reference style be close to photorealistic equipment renders, or more like clean vector/technical catalog illustrations?
