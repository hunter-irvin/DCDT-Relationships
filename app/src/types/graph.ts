export type ViewId = 'facility' | 'power' | 'thermal'

export type ObjectType =
  | 'facility'
  | 'space'
  | 'containment'
  | 'layout'
  | 'rack'
  | 'compute'
  | 'power'
  | 'thermal'
  | 'controls'

export type RelationshipType = 'hierarchical' | 'directional'

export type LaneId = 'liquid' | 'air' | 'power'

export type ThermalFlow = 'coldSupply' | 'warmReturn' | 'air' | 'control'

export type LoopId = 'facility' | 'cdu-secondary' | 'air' | 'power'

export interface GraphObject {
  id: string
  label: string
  type: ObjectType
  description?: string
  views: ViewId[]
  tags?: string[]
}

export interface GraphRelationship {
  id: string
  source: string
  target: string
  type: RelationshipType
  views: ViewId[]
  lane?: LaneId
  thermalFlow?: ThermalFlow
  loop?: LoopId
  label?: string
}

export interface ViewConfig {
  id: ViewId
  label: string
  relationshipType: RelationshipType
  layout: 'tree-vertical' | 'flow-horizontal' | 'multi-lane-horizontal'
  lanes?: Array<{ id: LaneId; label: string }>
}

export interface AppFilters {
  searchTerm: string
  activeTypeFilters: ObjectType[]
}
