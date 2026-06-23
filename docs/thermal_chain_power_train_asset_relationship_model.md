# Thermal Chain + Power Train Asset Relationship Model

**Document label:** Thermal Chain + Power Train  
**Purpose:** Shared markdown data model for representing high-density data center assets, logical groups, thermal relationships, and power relationships.  
**Use case:** Concept communication and future conversion into an interactive React Flow single-page application.

---

## 1. Modeling Approach

This file uses a shared canonical asset model. Assets that appear in both the thermal chain and power train, such as `rack`, `server_node`, `gpu`, `cdu`, `dcim`, and controllers, should use the same `Asset ID` everywhere.

The model has four major parts:

1. **Views** - named diagram states such as `thermal_chain` and `power_train`.
2. **Groups / lanes** - visual or logical regions such as Facility / Plant, Row / Branch Distribution, Rack Level, Liquid Supply, Liquid Return, Air Cooling, and Power Feed.
3. **Assets** - canonical objects represented as labeled boxes in the diagram.
4. **Relationships** - typed connections between assets, including flow, dependency, telemetry, control, and hierarchy.

Key principle: **temperature state and flow role usually belong to relationships, not assets.** A CDU, header, manifold, or rack can participate in both cold supply and warm return paths, so hot/cold should be modeled on the connecting edge.

---

## 2. Data Model Specification

### 2.1 View Registry Fields

| Field | Description | Example |
|---|---|---|
| View ID | Stable machine-readable identifier for the view | `thermal_chain` |
| View Name | Human-readable view label | Thermal Chain |
| Purpose | What the view communicates | Cooling and heat-removal flow |
| Primary Relationship Types | Relationship types rendered by default | Directional |
| Layout Style | Suggested layout pattern | Multi-lane horizontal |

### 2.2 Group / Lane Registry Fields

| Field | Description | Example |
|---|---|---|
| Group ID | Stable identifier for the group | `thermal_rack_level` |
| View ID | View where the group appears | `thermal_chain` |
| Label | Human-readable group label | Rack Level |
| Group Type | `section`, `lane`, or `zone` | `section` |
| Order | Suggested visual order | `4` |
| Parent Group ID | Optional parent grouping | `thermal_liquid_lane` |
| Description | Short explanation of the group | Rack-level valves and manifolds |

### 2.3 Asset Registry Fields

| Field | Description | Example |
|---|---|---|
| Asset ID | Stable canonical identifier | `rack` |
| Label | Human-readable label | Rack |
| Asset Type | Category of asset | `rack` |
| Views | Views where asset appears | `facility, thermal_chain, power_train` |
| Default Groups | Suggested group placement by view | `thermal_chain: thermal_rack_level` |
| Description | One-sentence description | Cabinet that houses IT equipment |

### 2.4 Relationship Registry Fields

| Field | Description | Example |
|---|---|---|
| Relationship ID | Stable identifier for relationship | `tc_liq_001` |
| View ID | View where relationship appears | `thermal_chain` |
| Source Asset ID | Source asset | `cdu` |
| Target Asset ID | Target asset | `overhead_supply_header` |
| Relationship Type | `hierarchical` or `directional` | `directional` |
| Relationship Subtype | More specific relationship category | `liquid_flow` |
| Medium | What moves or depends across the edge | `coolant` |
| Flow Role | `supply`, `return`, `feed`, `backup_feed`, `control`, `telemetry`, or `dependency` | `supply` |
| Temperature State | `cold`, `warm`, `hot`, or `neutral` | `cold` |
| Lane / Group ID | Visual lane or group for the edge | `thermal_liquid_supply_lane` |
| Direction Semantics | What the arrow means | fluid flow direction |
| Label / Notes | Optional display or explanation | Cold secondary coolant leaves CDU |

---

## 3. Enumerations

### 3.1 Views

| View ID | View Name | Purpose | Primary Relationship Types | Layout Style |
|---|---|---|---|---|
| `facility` | Facility | Physical containment and location hierarchy | Hierarchical | Top-down tree |
| `thermal_chain` | Thermal Chain | Cooling and heat-removal flow across liquid and air systems | Directional | Multi-lane horizontal |
| `power_train` | Power Train | Electrical source-to-load path, backup path, redundancy concept, and controls | Directional | Horizontal flow |

### 3.2 Asset Types

| Asset Type | Meaning |
|---|---|
| `facility` | Facility, site, building, or major physical boundary |
| `space` | Room, data hall, lab, pod, zone, or containment region |
| `layout` | Spatial organization element such as row or aisle |
| `rack` | Rack or cabinet-level asset |
| `compute` | IT compute asset such as chassis, node, server tray, GPU, CPU, or PSU |
| `thermal` | Cooling infrastructure asset |
| `power` | Electrical infrastructure asset |
| `controls` | Monitoring, controls, telemetry, protection, or automation asset |

### 3.3 Relationship Subtypes

| Relationship Type | Relationship Subtype | Meaning |
|---|---|---|
| `hierarchical` | `contains` | Parent-child physical or logical containment |
| `directional` | `liquid_flow` | Liquid coolant or water flow direction |
| `directional` | `air_flow` | Airflow or heat-removal direction |
| `directional` | `power_flow` | Electrical source-to-load direction |
| `directional` | `backup_power_flow` | Backup source-to-load direction |
| `directional` | `control_signal` | Control command or control dependency |
| `directional` | `telemetry_signal` | Sensor data, alarm, or measurement path |
| `directional` | `dependency` | Non-fluid/non-electrical dependency relationship |

### 3.4 Medium Values

| Medium | Meaning |
|---|---|
| `water` | Facility-side water loop |
| `coolant` | Secondary liquid cooling loop to IT equipment |
| `air` | Conditioned or exhaust air |
| `electricity` | Electrical power |
| `control_signal` | Control command or automation signal |
| `telemetry` | Monitoring signal, alarm, or measurement |
| `none` | Logical relationship with no flowing medium |

### 3.5 Flow Roles

| Flow Role | Meaning |
|---|---|
| `supply` | Supply path toward equipment or load |
| `return` | Return path away from equipment or load |
| `feed` | Electrical feed toward load |
| `backup_feed` | Backup electrical feed toward load |
| `exhaust` | Heated air or rejected heat leaving equipment |
| `control` | Control instruction or dependency |
| `telemetry` | Sensor data or alarm path |
| `dependency` | Non-flow dependency |

### 3.6 Temperature States

| Temperature State | Meaning |
|---|---|
| `cold` | Cold or cooled supply medium |
| `warm` | Warm return medium after absorbing heat |
| `hot` | Hot exhaust or high-temperature heat rejection state |
| `neutral` | Temperature state is not applicable or not visually encoded |

---

## 4. Group / Lane Registry

### 4.1 Thermal Chain Groups

| Group ID | View ID | Label | Group Type | Order | Parent Group ID | Description |
|---|---|---|---|---:|---|---|
| `thermal_facility_plant` | `thermal_chain` | Facility / Plant | section | 1 | - | Plant-side cooling and heat-rejection infrastructure. |
| `thermal_facility_distribution` | `thermal_chain` | Facility Distribution | section | 2 | - | Facility-level headers and CDU distribution equipment. |
| `thermal_row_branch_distribution` | `thermal_chain` | Row / Branch Distribution | section | 3 | - | Distribution assets that feed or collect from multiple racks. |
| `thermal_rack_level` | `thermal_chain` | Rack Level | section | 4 | - | Rack-level valves, manifolds, and connection points. |
| `thermal_it_equipment` | `thermal_chain` | IT Equipment | section | 5 | - | Server, tray, node, chip, and component-level cooling assets. |
| `thermal_liquid_supply_lane` | `thermal_chain` | Liquid Supply / Cold Path | lane | 1 | - | Cold liquid path from the plant or CDU toward IT equipment. |
| `thermal_liquid_return_lane` | `thermal_chain` | Liquid Return / Warm Path | lane | 2 | - | Warm liquid path back from IT equipment toward the CDU or plant. |
| `thermal_air_supply_lane` | `thermal_chain` | Air Supply / Cold Path | lane | 3 | - | Conditioned air path toward racks and IT equipment. |
| `thermal_air_return_lane` | `thermal_chain` | Air Return / Hot Path | lane | 4 | - | Heated exhaust air path back toward room cooling equipment. |
| `thermal_controls_lane` | `thermal_chain` | Thermal Controls and Sensors | lane | 5 | - | Leak, temperature, flow, pressure, and control relationships. |

### 4.2 Power Train Groups

| Group ID | View ID | Label | Group Type | Order | Parent Group ID | Description |
|---|---|---|---|---:|---|---|
| `power_utility_source` | `power_train` | Utility / Site Source | section | 1 | - | Incoming utility and site-level electrical sources. |
| `power_backup_source` | `power_train` | Backup Source | section | 2 | - | Generator and backup source equipment. |
| `power_medium_voltage` | `power_train` | Medium Voltage Distribution | section | 3 | - | Medium-voltage switchgear and transformation equipment. |
| `power_low_voltage` | `power_train` | Low Voltage Distribution | section | 4 | - | Low-voltage switchgear, UPS, and distribution panels. |
| `power_room_distribution` | `power_train` | Room / Row Distribution | section | 5 | - | Busway, RPPs, and branch circuits feeding racks. |
| `power_rack_level` | `power_train` | Rack Level | section | 6 | - | Rack PDUs and rack-level power feeds. |
| `power_it_equipment` | `power_train` | IT Equipment | section | 7 | - | Server, PSU, tray, node, and GPU loads. |
| `power_primary_feed_lane` | `power_train` | Primary Power Feed | lane | 1 | - | Simplified source-to-load power path. |
| `power_backup_feed_lane` | `power_train` | Backup / Standby Feed | lane | 2 | - | Simplified generator-backed path that supports resilience. |
| `power_controls_lane` | `power_train` | Power Controls and Telemetry | lane | 3 | - | Monitoring, breaker status, metering, and control dependencies. |

---

## 5. Canonical Asset Registry

### 5.1 Shared Physical and IT Assets

| Asset ID | Label | Asset Type | Views | Default Groups | Description |
|---|---|---|---|---|---|
| `facility` | Facility | facility | facility, thermal_chain, power_train | facility: root; thermal_chain: thermal_facility_plant; power_train: power_utility_source | Building or physical facility boundary containing data center infrastructure. |
| `lab_data_hall` | Lab / Data Hall | space | facility, thermal_chain, power_train | facility: facility; thermal_chain: thermal_facility_distribution; power_train: power_room_distribution | Data hall or lab space that contains racks and supporting infrastructure. |
| `zone_pod` | Zone / Pod | space | facility, thermal_chain, power_train | facility: lab_data_hall; thermal_chain: thermal_row_branch_distribution; power_train: power_room_distribution | Logical grouping of rows, racks, and supporting distribution assets. |
| `hot_aisle_containment` | Hot Aisle Containment | space | facility, thermal_chain | facility: zone_pod; thermal_chain: thermal_air_return_lane | Enclosure that captures hot exhaust air and separates it from cold supply air. |
| `cold_aisle` | Cold Aisle | layout | facility, thermal_chain | facility: zone_pod; thermal_chain: thermal_air_supply_lane | Aisle delivering conditioned supply air to rack intakes. |
| `hot_aisle` | Hot Aisle | layout | facility, thermal_chain | facility: hot_aisle_containment; thermal_chain: thermal_air_return_lane | Aisle collecting hot exhaust air from the rear of racks. |
| `row` | Row | layout | facility, thermal_chain, power_train | facility: zone_pod; thermal_chain: thermal_row_branch_distribution; power_train: power_room_distribution | Line of racks arranged within a data hall or pod. |
| `rack` | Rack | rack | facility, thermal_chain, power_train | facility: row; thermal_chain: thermal_rack_level; power_train: power_rack_level | Cabinet that houses IT equipment, power distribution, and cooling connections. |
| `rack_unit_chassis` | Rack Unit / Chassis | compute | facility, thermal_chain, power_train | facility: rack; thermal_chain: thermal_it_equipment; power_train: power_it_equipment | Rack-mounted chassis or enclosure holding one or more server nodes. |
| `server_node` | Server Tray / Server Node | compute | facility, thermal_chain, power_train | facility: rack_unit_chassis; thermal_chain: thermal_it_equipment; power_train: power_it_equipment | Compute tray or node that hosts processors, memory, accelerators, and cooling connections. |
| `gpu` | GPU | compute | facility, thermal_chain, power_train | facility: server_node; thermal_chain: thermal_it_equipment; power_train: power_it_equipment | High-power accelerator that consumes electrical power and generates heat. |
| `cpu` | CPU | compute | facility, thermal_chain, power_train | facility: server_node; thermal_chain: thermal_it_equipment; power_train: power_it_equipment | Processor that consumes power and may be cooled by air or liquid depending on design. |
| `memory_nic_storage` | Memory / NIC / Storage | compute | thermal_chain, power_train | thermal_chain: thermal_it_equipment; power_train: power_it_equipment | Supporting server components that consume power and often contribute residual air-cooled heat. |
| `psu` | Power Supply Unit | compute | power_train, thermal_chain | power_train: power_it_equipment; thermal_chain: thermal_air_return_lane | Server power supply that converts rack power for IT components and contributes residual heat. |

### 5.2 Thermal Chain Assets

| Asset ID | Label | Asset Type | Views | Default Groups | Description |
|---|---|---|---|---|---|
| `heat_rejection_system` | Heat Rejection System | thermal | thermal_chain | thermal_chain: thermal_facility_plant | Cooling tower, dry cooler, or other system that rejects heat to ambient conditions. |
| `chiller_plant` | Chiller Plant | thermal | thermal_chain | thermal_chain: thermal_facility_plant | Plant equipment that produces chilled or cooled facility water for cooling loads. |
| `facility_supply_header` | Facility Supply Header | thermal | thermal_chain | thermal_chain: thermal_facility_distribution | Facility-side supply header carrying cooled water toward cooling loads. |
| `facility_return_header` | Facility Return Header | thermal | thermal_chain | thermal_chain: thermal_facility_distribution | Facility-side return header carrying warmed water back toward the plant. |
| `cdu` | Coolant Distribution Unit (CDU) | thermal | facility, thermal_chain, power_train | facility: lab_data_hall; thermal_chain: thermal_facility_distribution; power_train: power_it_equipment | Unit that separates facility and secondary liquid loops while pumping and controlling coolant to racks. |
| `overhead_supply_header` | Overhead Supply Header | thermal | thermal_chain | thermal_chain: thermal_facility_distribution | Secondary supply header that carries cold coolant from the CDU toward rows or branches. |
| `overhead_return_header` | Overhead Return Header | thermal | thermal_chain | thermal_chain: thermal_facility_distribution | Secondary return header that carries warm coolant back from row or branch returns to the CDU. |
| `row_branch_supply_manifold` | Row / Branch Supply Manifold | thermal | thermal_chain | thermal_chain: thermal_row_branch_distribution | Manifold that distributes cold coolant from a header to multiple racks in a row or branch. |
| `row_branch_return_manifold` | Row / Branch Return Manifold | thermal | thermal_chain | thermal_chain: thermal_row_branch_distribution | Manifold that aggregates warm return coolant from multiple racks. |
| `rack_supply_isolation_valve` | Rack Supply Isolation Valve | thermal | thermal_chain | thermal_chain: thermal_rack_level | Valve that isolates the cold supply side of a rack for service or fault response. |
| `rack_return_isolation_valve` | Rack Return Isolation Valve | thermal | thermal_chain | thermal_chain: thermal_rack_level | Valve that isolates the warm return side of a rack for service or fault response. |
| `rack_supply_manifold` | Rack Supply Manifold | thermal | thermal_chain | thermal_chain: thermal_rack_level | Rack-level manifold that distributes cold coolant to server nodes or trays. |
| `rack_return_manifold` | Rack Return Manifold | thermal | thermal_chain | thermal_chain: thermal_rack_level | Rack-level manifold that collects warm coolant returning from server nodes or trays. |
| `quick_disconnect_supply` | Supply Quick Disconnects | thermal | thermal_chain | thermal_chain: thermal_rack_level | Serviceable supply-side connectors between rack distribution and server trays or nodes. |
| `quick_disconnect_return` | Return Quick Disconnects | thermal | thermal_chain | thermal_chain: thermal_rack_level | Serviceable return-side connectors between server trays or nodes and rack return distribution. |
| `server_internal_supply_manifold` | Server / Tray Supply Manifold | thermal | thermal_chain | thermal_chain: thermal_it_equipment | Internal node or tray distribution path that routes cold coolant to cold plates. |
| `server_internal_return_manifold` | Server / Tray Return Manifold | thermal | thermal_chain | thermal_chain: thermal_it_equipment | Internal node or tray path that collects warm coolant leaving cold plates. |
| `cold_plate_gpu` | GPU Cold Plate | thermal | thermal_chain | thermal_chain: thermal_it_equipment | Heat exchanger attached to a GPU package to transfer chip heat into liquid coolant. |
| `cold_plate_cpu` | CPU Cold Plate | thermal | thermal_chain | thermal_chain: thermal_it_equipment | Heat exchanger attached to a CPU package to transfer processor heat into liquid coolant. |
| `crah_crac` | CRAH / CRAC | thermal | thermal_chain | thermal_chain: thermal_facility_distribution | Room cooling unit that conditions air and removes residual heat from the data hall. |
| `cold_supply_air` | Cold Supply Air | thermal | thermal_chain | thermal_chain: thermal_air_supply_lane | Conditioned air delivered toward rack intakes. |
| `server_fans` | Server Fans | thermal | thermal_chain | thermal_chain: thermal_it_equipment | Fans that move air through the server chassis to remove residual heat. |
| `residual_component_heat` | Residual Component Heat | thermal | thermal_chain | thermal_chain: thermal_it_equipment | Heat from components not fully captured by direct liquid cooling. |
| `hot_exhaust_air` | Hot Exhaust Air | thermal | thermal_chain | thermal_chain: thermal_air_return_lane | Heated air leaving servers and racks toward the hot aisle. |
| `leak_detection_rope` | Leak Detection Rope | controls | thermal_chain | thermal_chain: thermal_controls_lane | Sensing cable that detects the presence of liquid along a monitored path. |
| `spot_leak_sensor` | Spot Leak Sensor | controls | thermal_chain | thermal_chain: thermal_controls_lane | Point sensor used to detect liquid in a tray, pan, low point, or critical location. |
| `temperature_sensor` | Temperature Sensor | controls | thermal_chain | thermal_chain: thermal_controls_lane | Sensor that measures supply, return, room, rack, or component temperature. |
| `flow_sensor` | Flow Sensor | controls | thermal_chain | thermal_chain: thermal_controls_lane | Sensor that measures coolant flow through a branch, rack, or equipment path. |
| `pressure_sensor` | Pressure Sensor | controls | thermal_chain | thermal_chain: thermal_controls_lane | Sensor that measures differential or absolute pressure in the cooling loop. |
| `thermal_controller` | Thermal Controller / PLC / BMS | controls | thermal_chain, power_train | thermal_chain: thermal_controls_lane; power_train: power_controls_lane | Control system that monitors thermal conditions and can command alarms, valves, pumps, or shutdown logic. |

### 5.3 Power Train Assets

| Asset ID | Label | Asset Type | Views | Default Groups | Description |
|---|---|---|---|---|---|
| `utility_grid` | Utility Grid | power | power_train | power_train: power_utility_source | Primary external electrical source feeding the facility. |
| `service_entrance` | Service Entrance | power | power_train | power_train: power_utility_source | Facility entry point where utility power is received and metered or protected. |
| `medium_voltage_switchgear` | Medium Voltage Switchgear | power | power_train | power_train: power_medium_voltage | Switchgear that distributes and protects incoming medium-voltage power. |
| `generator` | Standby Generator | power | power_train | power_train: power_backup_source | Backup electrical source that supports the facility during utility interruptions. |
| `generator_paralleling_gear` | Generator Paralleling Gear | power | power_train | power_train: power_backup_source | Equipment that synchronizes and combines multiple generators or connects generator output to distribution. |
| `ats` | Automatic Transfer Switch / Transfer Scheme | power | power_train | power_train: power_low_voltage | Transfer equipment or control scheme that shifts supported loads between utility and standby sources. |
| `transformer` | Transformer | power | power_train | power_train: power_medium_voltage | Electrical transformer that steps voltage down for low-voltage distribution. |
| `low_voltage_switchgear` | Low Voltage Switchgear | power | power_train | power_train: power_low_voltage | Low-voltage switchgear that distributes protected power to downstream systems. |
| `ups_input_switchboard` | UPS Input Switchboard | power | power_train | power_train: power_low_voltage | Switchboard that feeds UPS systems from upstream distribution. |
| `ups` | UPS | power | power_train | power_train: power_low_voltage | Uninterruptible power supply that conditions power and bridges load during transfer or outage events. |
| `ups_battery_string` | UPS Battery String | power | power_train | power_train: power_low_voltage | Stored-energy system that supports the UPS during short-duration power interruptions. |
| `ups_output_switchboard` | UPS Output Switchboard | power | power_train | power_train: power_low_voltage | Switchboard that distributes UPS-backed output to downstream panels or busways. |
| `static_transfer_switch` | Static Transfer Switch (STS) | power | power_train | power_train: power_low_voltage | Fast transfer device that can shift a load between two power sources where used. |
| `busway` | Overhead Busway / Bus Duct | power | power_train | power_train: power_room_distribution | Overhead or distributed power path feeding rack rows or tap boxes. |
| `busway_tap_box` | Busway Tap Box | power | power_train | power_train: power_room_distribution | Tap-off point from busway to a downstream rack or distribution circuit. |
| `rpp` | Remote Power Panel (RPP) | power | power_train | power_train: power_room_distribution | Distribution panel that feeds branch circuits to racks or rack PDUs. |
| `branch_circuit` | Branch Circuit | power | power_train | power_train: power_room_distribution | Final circuit path from distribution equipment to rack-level power. |
| `circuit_breaker` | Circuit Breaker | power | power_train | power_train: power_room_distribution | Protective device that interrupts electrical flow during overloads or faults. |
| `rack_pdu_a` | Rack PDU A | power | power_train | power_train: power_rack_level | Rack-level power distribution unit representing the primary or A-side feed. |
| `rack_pdu_b` | Rack PDU B | power | power_train | power_train: power_rack_level | Rack-level power distribution unit representing the redundant or B-side feed. |
| `server_psu_a` | Server PSU A | compute | power_train | power_train: power_it_equipment | Server power supply connected to the A-side rack feed. |
| `server_psu_b` | Server PSU B | compute | power_train | power_train: power_it_equipment | Server power supply connected to the B-side rack feed. |
| `server_power_plane` | Server Power Plane | compute | power_train | power_train: power_it_equipment | Internal server power distribution path feeding CPUs, GPUs, memory, fans, and controllers. |
| `gpu_vrm` | GPU Voltage Regulation | compute | power_train | power_train: power_it_equipment | Voltage regulation stage that conditions power for GPU consumption. |
| `metering_ct` | Metering CT / Power Meter | controls | power_train | power_train: power_controls_lane | Metering device that measures current, power, energy, or load state. |
| `breaker_status_sensor` | Breaker Status Sensor | controls | power_train | power_train: power_controls_lane | Sensor or contact that reports breaker open, closed, or tripped status. |
| `epms` | EPMS / Power Monitoring System | controls | power_train | power_train: power_controls_lane | Electrical power monitoring system that aggregates metering, alarms, and status. |
| `dcim` | DCIM | controls | thermal_chain, power_train | thermal_chain: thermal_controls_lane; power_train: power_controls_lane | Data center infrastructure management system used to contextualize asset, power, cooling, and alarm data. |

---

## 6. Facility Hierarchy Seed Relationships

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `fac_001` | `facility` | `facility` | `lab_data_hall` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Facility contains the data hall or lab. |
| `fac_002` | `facility` | `lab_data_hall` | `zone_pod` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Data hall contains zones or pods. |
| `fac_003` | `facility` | `zone_pod` | `hot_aisle_containment` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Zone or pod contains hot aisle containment. |
| `fac_004` | `facility` | `hot_aisle_containment` | `hot_aisle` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Hot aisle containment encloses the hot aisle. |
| `fac_005` | `facility` | `zone_pod` | `cold_aisle` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Zone or pod contains cold aisle space. |
| `fac_006` | `facility` | `zone_pod` | `row` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Zone or pod contains rows. |
| `fac_007` | `facility` | `row` | `rack` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Row contains racks. |
| `fac_008` | `facility` | `rack` | `rack_unit_chassis` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Rack contains rack-mounted chassis. |
| `fac_009` | `facility` | `rack_unit_chassis` | `server_node` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Chassis contains server nodes or trays. |
| `fac_010` | `facility` | `server_node` | `gpu` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Server node contains GPUs. |
| `fac_011` | `facility` | `server_node` | `cpu` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Server node contains CPUs. |
| `fac_012` | `facility` | `lab_data_hall` | `cdu` | hierarchical | contains | none | dependency | neutral | - | parent-child containment | Data hall or supporting room contains CDU equipment. |

---

## 7. Thermal Chain Seed Relationships

### 7.1 Liquid Cooling Supply and Return

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `tc_liq_001` | `thermal_chain` | `heat_rejection_system` | `chiller_plant` | directional | liquid_flow | water | supply | cold | thermal_liquid_supply_lane | facility water flow direction | Heat rejection supports chilled or cooled water production. |
| `tc_liq_002` | `thermal_chain` | `chiller_plant` | `facility_supply_header` | directional | liquid_flow | water | supply | cold | thermal_liquid_supply_lane | facility water flow direction | Chiller plant sends cooled facility water to the supply header. |
| `tc_liq_003` | `thermal_chain` | `facility_supply_header` | `cdu` | directional | liquid_flow | water | supply | cold | thermal_liquid_supply_lane | facility water flow direction | Facility supply header feeds cold water to the CDU heat exchanger. |
| `tc_liq_004` | `thermal_chain` | `cdu` | `overhead_supply_header` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | CDU sends cold secondary coolant to the overhead supply header. |
| `tc_liq_005` | `thermal_chain` | `overhead_supply_header` | `row_branch_supply_manifold` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Overhead supply header feeds the row or branch supply manifold. |
| `tc_liq_006` | `thermal_chain` | `row_branch_supply_manifold` | `rack_supply_isolation_valve` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Row or branch supply feeds the rack supply isolation valve. |
| `tc_liq_007` | `thermal_chain` | `rack_supply_isolation_valve` | `rack_supply_manifold` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Supply isolation valve feeds the rack supply manifold. |
| `tc_liq_008` | `thermal_chain` | `rack_supply_manifold` | `quick_disconnect_supply` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Rack supply manifold feeds serviceable supply quick disconnects. |
| `tc_liq_009` | `thermal_chain` | `quick_disconnect_supply` | `server_internal_supply_manifold` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Supply quick disconnects feed the tray or node supply manifold. |
| `tc_liq_010` | `thermal_chain` | `server_internal_supply_manifold` | `cold_plate_gpu` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Internal supply path delivers cold coolant to the GPU cold plate. |
| `tc_liq_011` | `thermal_chain` | `server_internal_supply_manifold` | `cold_plate_cpu` | directional | liquid_flow | coolant | supply | cold | thermal_liquid_supply_lane | secondary coolant flow direction | Internal supply path delivers cold coolant to the CPU cold plate. |
| `tc_liq_012` | `thermal_chain` | `cold_plate_gpu` | `server_internal_return_manifold` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Warm coolant leaves the GPU cold plate and enters the tray return path. |
| `tc_liq_013` | `thermal_chain` | `cold_plate_cpu` | `server_internal_return_manifold` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Warm coolant leaves the CPU cold plate and enters the tray return path. |
| `tc_liq_014` | `thermal_chain` | `server_internal_return_manifold` | `quick_disconnect_return` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Tray return manifold sends warm coolant to return quick disconnects. |
| `tc_liq_015` | `thermal_chain` | `quick_disconnect_return` | `rack_return_manifold` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Return quick disconnects feed the rack return manifold. |
| `tc_liq_016` | `thermal_chain` | `rack_return_manifold` | `rack_return_isolation_valve` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Rack return manifold flows through the return isolation valve. |
| `tc_liq_017` | `thermal_chain` | `rack_return_isolation_valve` | `row_branch_return_manifold` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Rack return isolation valve sends warm coolant to row or branch return. |
| `tc_liq_018` | `thermal_chain` | `row_branch_return_manifold` | `overhead_return_header` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Row or branch return manifold aggregates warm coolant to the return header. |
| `tc_liq_019` | `thermal_chain` | `overhead_return_header` | `cdu` | directional | liquid_flow | coolant | return | warm | thermal_liquid_return_lane | secondary coolant flow direction | Overhead return header sends warm secondary coolant back to the CDU. |
| `tc_liq_020` | `thermal_chain` | `cdu` | `facility_return_header` | directional | liquid_flow | water | return | warm | thermal_liquid_return_lane | facility water flow direction | CDU transfers heat to the facility loop and sends warm facility water to return. |
| `tc_liq_021` | `thermal_chain` | `facility_return_header` | `chiller_plant` | directional | liquid_flow | water | return | warm | thermal_liquid_return_lane | facility water flow direction | Facility return header carries warm water back to the chiller plant. |
| `tc_liq_022` | `thermal_chain` | `chiller_plant` | `heat_rejection_system` | directional | liquid_flow | water | return | warm | thermal_liquid_return_lane | heat rejection direction | Chiller plant rejects absorbed heat through the heat rejection system. |

### 7.2 Air Cooling Supply and Return

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `tc_air_001` | `thermal_chain` | `crah_crac` | `cold_supply_air` | directional | air_flow | air | supply | cold | thermal_air_supply_lane | air flow direction | CRAH or CRAC provides conditioned supply air. |
| `tc_air_002` | `thermal_chain` | `cold_supply_air` | `cold_aisle` | directional | air_flow | air | supply | cold | thermal_air_supply_lane | air flow direction | Cold supply air is delivered into the cold aisle. |
| `tc_air_003` | `thermal_chain` | `cold_aisle` | `rack` | directional | air_flow | air | supply | cold | thermal_air_supply_lane | air flow direction | Cold aisle air enters rack intakes. |
| `tc_air_004` | `thermal_chain` | `rack` | `server_fans` | directional | air_flow | air | supply | cold | thermal_air_supply_lane | air flow direction | Server fans pull air through rack-mounted equipment. |
| `tc_air_005` | `thermal_chain` | `server_fans` | `memory_nic_storage` | directional | air_flow | air | supply | cold | thermal_air_supply_lane | air flow direction | Air removes heat from components not directly liquid cooled. |
| `tc_air_006` | `thermal_chain` | `memory_nic_storage` | `residual_component_heat` | directional | air_flow | air | exhaust | warm | thermal_air_return_lane | heat transfer direction | Residual component heat is transferred to moving air. |
| `tc_air_007` | `thermal_chain` | `psu` | `residual_component_heat` | directional | air_flow | air | exhaust | warm | thermal_air_return_lane | heat transfer direction | Power supplies add residual heat to the air stream. |
| `tc_air_008` | `thermal_chain` | `residual_component_heat` | `hot_exhaust_air` | directional | air_flow | air | exhaust | hot | thermal_air_return_lane | air flow direction | Heated air exits the server or rack. |
| `tc_air_009` | `thermal_chain` | `hot_exhaust_air` | `hot_aisle` | directional | air_flow | air | exhaust | hot | thermal_air_return_lane | air flow direction | Hot exhaust air enters the hot aisle. |
| `tc_air_010` | `thermal_chain` | `hot_aisle` | `hot_aisle_containment` | directional | air_flow | air | exhaust | hot | thermal_air_return_lane | air flow direction | Hot aisle containment captures exhaust air. |
| `tc_air_011` | `thermal_chain` | `hot_aisle_containment` | `crah_crac` | directional | air_flow | air | return | warm | thermal_air_return_lane | air flow direction | Return air flows back to CRAH or CRAC for cooling. |

### 7.3 Thermal Controls, Sensors, and Alarms

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `tc_ctrl_001` | `thermal_chain` | `leak_detection_rope` | `thermal_controller` | directional | telemetry_signal | telemetry | telemetry | neutral | thermal_controls_lane | alarm signal direction | Leak detection rope sends alarm state to the controller. |
| `tc_ctrl_002` | `thermal_chain` | `spot_leak_sensor` | `thermal_controller` | directional | telemetry_signal | telemetry | telemetry | neutral | thermal_controls_lane | alarm signal direction | Spot leak sensor sends local leak status to the controller. |
| `tc_ctrl_003` | `thermal_chain` | `temperature_sensor` | `thermal_controller` | directional | telemetry_signal | telemetry | telemetry | neutral | thermal_controls_lane | telemetry direction | Temperature sensor sends thermal measurements to the controller. |
| `tc_ctrl_004` | `thermal_chain` | `flow_sensor` | `thermal_controller` | directional | telemetry_signal | telemetry | telemetry | neutral | thermal_controls_lane | telemetry direction | Flow sensor sends coolant flow measurements to the controller. |
| `tc_ctrl_005` | `thermal_chain` | `pressure_sensor` | `thermal_controller` | directional | telemetry_signal | telemetry | telemetry | neutral | thermal_controls_lane | telemetry direction | Pressure sensor sends pressure data to the controller. |
| `tc_ctrl_006` | `thermal_chain` | `thermal_controller` | `rack_supply_isolation_valve` | directional | control_signal | control_signal | control | neutral | thermal_controls_lane | control command direction | Controller may command the supply isolation valve during service or alarms. |
| `tc_ctrl_007` | `thermal_chain` | `thermal_controller` | `rack_return_isolation_valve` | directional | control_signal | control_signal | control | neutral | thermal_controls_lane | control command direction | Controller may command the return isolation valve during service or alarms. |
| `tc_ctrl_008` | `thermal_chain` | `thermal_controller` | `cdu` | directional | control_signal | control_signal | control | neutral | thermal_controls_lane | control command direction | Controller may coordinate CDU pump, valve, or alarm behavior. |
| `tc_ctrl_009` | `thermal_chain` | `thermal_controller` | `dcim` | directional | telemetry_signal | telemetry | telemetry | neutral | thermal_controls_lane | telemetry direction | Thermal controller publishes alarms and measurements to DCIM. |

---

## 8. Power Train Seed Relationships

### 8.1 Simplified Primary Power Feed

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pt_pri_001` | `power_train` | `utility_grid` | `service_entrance` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Utility power enters the facility through the service entrance. |
| `pt_pri_002` | `power_train` | `service_entrance` | `medium_voltage_switchgear` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Service entrance feeds medium-voltage switchgear. |
| `pt_pri_003` | `power_train` | `medium_voltage_switchgear` | `transformer` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Medium-voltage switchgear feeds a transformer. |
| `pt_pri_004` | `power_train` | `transformer` | `low_voltage_switchgear` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Transformer steps voltage down to low-voltage distribution. |
| `pt_pri_005` | `power_train` | `low_voltage_switchgear` | `ups_input_switchboard` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Low-voltage switchgear feeds UPS input distribution. |
| `pt_pri_006` | `power_train` | `ups_input_switchboard` | `ups` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | UPS input switchboard feeds the UPS. |
| `pt_pri_007` | `power_train` | `ups` | `ups_output_switchboard` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | UPS provides conditioned and backed-up output power. |
| `pt_pri_008` | `power_train` | `ups_output_switchboard` | `busway` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | UPS output switchboard feeds overhead busway or distribution. |
| `pt_pri_009` | `power_train` | `busway` | `busway_tap_box` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Busway tap box draws power from overhead busway. |
| `pt_pri_010` | `power_train` | `busway_tap_box` | `branch_circuit` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Tap box feeds the branch circuit to the rack. |
| `pt_pri_011` | `power_train` | `branch_circuit` | `circuit_breaker` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Branch circuit passes through circuit protection. |
| `pt_pri_012` | `power_train` | `circuit_breaker` | `rack_pdu_a` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Circuit breaker feeds the A-side rack PDU. |
| `pt_pri_013` | `power_train` | `rack_pdu_a` | `server_psu_a` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | A-side rack PDU feeds the A-side server PSU. |
| `pt_pri_014` | `power_train` | `server_psu_a` | `server_power_plane` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Server PSU feeds the internal power plane. |
| `pt_pri_015` | `power_train` | `server_power_plane` | `gpu_vrm` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Server power plane feeds GPU voltage regulation. |
| `pt_pri_016` | `power_train` | `gpu_vrm` | `gpu` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | GPU voltage regulation feeds the GPU load. |
| `pt_pri_017` | `power_train` | `server_power_plane` | `cpu` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Server power plane feeds CPU loads. |
| `pt_pri_018` | `power_train` | `server_power_plane` | `memory_nic_storage` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Server power plane feeds memory, networking, and storage. |

### 8.2 Simplified Redundant / B-Side Rack Feed

This is a simplified representation of redundancy. It does not fully model independent A-side and B-side upstream lineups, but it preserves the concept of dual rack-level feeds and dual server PSUs.

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pt_red_001` | `power_train` | `ups_output_switchboard` | `static_transfer_switch` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | UPS-backed distribution may feed an STS where used. |
| `pt_red_002` | `power_train` | `static_transfer_switch` | `rack_pdu_b` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | STS or alternate distribution feeds the B-side rack PDU in this simplified model. |
| `pt_red_003` | `power_train` | `rack_pdu_b` | `server_psu_b` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | B-side rack PDU feeds the B-side server PSU. |
| `pt_red_004` | `power_train` | `server_psu_b` | `server_power_plane` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | B-side PSU also feeds the internal server power plane. |

### 8.3 Backup / Standby Power Path

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pt_bak_001` | `power_train` | `generator` | `generator_paralleling_gear` | directional | backup_power_flow | electricity | backup_feed | neutral | power_backup_feed_lane | backup source-to-load direction | Standby generator output feeds paralleling gear or backup distribution. |
| `pt_bak_002` | `power_train` | `generator_paralleling_gear` | `ats` | directional | backup_power_flow | electricity | backup_feed | neutral | power_backup_feed_lane | backup source-to-load direction | Paralleling gear feeds transfer equipment or transfer scheme. |
| `pt_bak_003` | `power_train` | `ats` | `low_voltage_switchgear` | directional | backup_power_flow | electricity | backup_feed | neutral | power_backup_feed_lane | backup source-to-load direction | Transfer scheme supplies low-voltage distribution during backup operation. |
| `pt_bak_004` | `power_train` | `ups_battery_string` | `ups` | directional | backup_power_flow | electricity | backup_feed | neutral | power_backup_feed_lane | stored-energy support direction | UPS batteries support the UPS during transfer or short-duration outage events. |

### 8.4 Power Train Controls, Metering, and Shared Dependencies

| Relationship ID | View ID | Source Asset ID | Target Asset ID | Relationship Type | Relationship Subtype | Medium | Flow Role | Temperature State | Lane / Group ID | Direction Semantics | Label / Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pt_ctrl_001` | `power_train` | `metering_ct` | `epms` | directional | telemetry_signal | telemetry | telemetry | neutral | power_controls_lane | telemetry direction | Power meter sends load and energy data to EPMS. |
| `pt_ctrl_002` | `power_train` | `breaker_status_sensor` | `epms` | directional | telemetry_signal | telemetry | telemetry | neutral | power_controls_lane | telemetry direction | Breaker status sensor sends open, closed, or tripped status to EPMS. |
| `pt_ctrl_003` | `power_train` | `epms` | `dcim` | directional | telemetry_signal | telemetry | telemetry | neutral | power_controls_lane | telemetry direction | EPMS publishes power alarms and measurements to DCIM. |
| `pt_ctrl_004` | `power_train` | `dcim` | `thermal_controller` | directional | dependency | telemetry | dependency | neutral | power_controls_lane | system integration direction | DCIM can correlate power and thermal state across shared assets. |
| `pt_ctrl_005` | `power_train` | `rack_pdu_a` | `metering_ct` | directional | telemetry_signal | telemetry | telemetry | neutral | power_controls_lane | telemetry association | Rack PDU A provides metered power data. |
| `pt_ctrl_006` | `power_train` | `rack_pdu_b` | `metering_ct` | directional | telemetry_signal | telemetry | telemetry | neutral | power_controls_lane | telemetry association | Rack PDU B provides metered power data. |
| `pt_ctrl_007` | `power_train` | `circuit_breaker` | `breaker_status_sensor` | directional | telemetry_signal | telemetry | telemetry | neutral | power_controls_lane | telemetry association | Circuit breaker state is monitored by breaker status sensor. |
| `pt_ctrl_008` | `power_train` | `rack_pdu_a` | `cdu` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Rack or local power distribution can support CDU controls or auxiliaries where applicable. |
| `pt_ctrl_009` | `power_train` | `server_power_plane` | `server_fans` | directional | power_flow | electricity | feed | neutral | power_primary_feed_lane | source-to-load power direction | Server power plane powers server fans that support air cooling. |

---

## 9. Visual Encoding Rules

| Data Condition | Suggested Visual Encoding |
|---|---|
| `relationship_type = hierarchical` | Neutral line, no arrowhead |
| `relationship_type = directional` | Arrowed edge |
| `relationship_subtype = liquid_flow` and `flow_role = supply` | Blue arrow |
| `relationship_subtype = liquid_flow` and `flow_role = return` | Red arrow |
| `relationship_subtype = air_flow` and `flow_role = supply` | Light blue or teal arrow |
| `relationship_subtype = air_flow` and `flow_role = exhaust/return` | Orange, red-orange, or gray arrow |
| `relationship_subtype = power_flow` | Amber or yellow arrow |
| `relationship_subtype = backup_power_flow` | Dashed amber or yellow arrow |
| `relationship_subtype = telemetry_signal` | Thin purple or gray arrow |
| `relationship_subtype = control_signal` | Dashed purple arrow |
| `group_type = section` | Vertical region or column label |
| `group_type = lane` | Horizontal swimlane label |

---

## 10. Modeling Notes and Assumptions

1. This model is designed for conceptual communication, not construction documentation.
2. Power train data is intentionally simplified while preserving high-density data center concepts such as UPS-backed distribution, standby generation, rack PDUs, dual server PSUs, and power monitoring.
3. The redundant power feed is represented at a simplified rack/server level and does not fully model independent A-side and B-side upstream lineups.
4. Thermal chain data includes both liquid cooling and air cooling because high-density racks typically still have residual air-cooled loads even when GPUs or CPUs are direct-liquid cooled.
5. The return path from a cold plate begins after heat is transferred into the coolant; the coolant does not conceptually go back through the cold plate as a separate return component.
6. Rack isolation is represented as supply-side and return-side isolation because service isolation commonly requires both sides of the rack liquid circuit to be isolated.
7. Shared assets should not be duplicated across views; use the same `Asset ID` and attach multiple view memberships or group placements.
8. Cold/warm state is modeled on relationships because headers, manifolds, CDUs, and racks may participate in both cold supply and warm return contexts.
9. For the React Flow application, group and lane IDs can be used to drive automatic layout, background regions, lane labels, and edge styling.
