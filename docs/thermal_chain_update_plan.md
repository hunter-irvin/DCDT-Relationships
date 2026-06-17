# Thermal Chain Audit and Update Plan

## Current Audit

The current Thermal Chain data uses one generic `liquid` lane for every water-side relationship. That makes the thermal path readable as a loop, but it does not distinguish:

- cold water supply versus warm water return
- facility/chiller-side cooling loop versus CDU secondary loop
- heat pickup path through the server/cold plate versus heat rejection back to the plant

The current model also included a sensing/leak detection channel that connected leak, rope, temperature, flow, and pressure sensors to the PLC. That channel has been removed for now from the active dataset.

## Proposed Updates

| Step | Update | Purpose | QA Check |
| ---: | --- | --- | --- |
| 1 | Add thermal flow metadata to relationships | Distinguish `coldSupply`, `warmReturn`, and neutral/control/air flows | Every liquid edge has a thermal flow value |
| 2 | Color liquid edges by flow temperature | Render cold supply blue and warm return red | Thermal view shows blue outbound supply and red inbound return |
| 3 | Split facility loop from CDU secondary loop | Make chiller/plant-side and rack/server-side loops conceptually distinct | Facility loop and CDU loop can be visually traced independently |
| 4 | Rename ambiguous plant/header objects | Clarify chiller, facility supply header, and facility return header roles | Object labels match the loop they belong to |
| 5 | Adjust Thermal layout into clearer lanes | Separate cold supply, warm return, air cooling, and controls/shared assets | No node overlap and loops remain readable at fit-to-screen |
| 6 | Update legend and relationship summary | Explain red/blue water semantics and loop categories | Sidebar accurately describes visible edge colors |
| 7 | Re-run data integrity and visual QA | Confirm no broken references or visual regressions | Build/lint pass, relationships resolve, browser screenshot reviewed |

## Recommended Thermal Model

### Facility / Chiller Loop

This loop should represent the building-side heat rejection path:

- `chillerPlant` or `coolingPlant`
- `facilitySupplyHeader`
- `cduPrimarySide`
- `facilityReturnHeader`
- back to `chillerPlant` / `coolingPlant`

Cold water supply should flow from the chiller/plant toward the CDU and render blue. Warm return should flow from the CDU back toward the chiller/plant and render red.

### CDU Secondary Loop

This loop should represent the technical cooling distribution path from the CDU to IT equipment:

- `cdu`
- `overheadSupply`
- `rowBranchSupply`
- `rackSupplyManifold`
- `quickDisconnect`
- `serverNode`
- `coldPlate`
- `serverReturn`
- `rackReturnManifold`
- `rowBranchReturn`
- `overheadReturn`
- back to `cdu`

Cold supply edges should render blue through the supply path. Warm return edges should render red from the cold plate/server return path back to the CDU.

## Implementation Notes

Prefer adding a relationship-level field such as:

```ts
thermalFlow?: 'coldSupply' | 'warmReturn' | 'air' | 'control'
loop?: 'facility' | 'cdu-secondary' | 'air'
```

This avoids overloading the existing `lane` field. `lane` can still describe visual placement, while `thermalFlow` controls edge color and `loop` controls grouping/legend behavior.
