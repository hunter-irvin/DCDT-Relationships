import type {
  AssetType,
  FlowRole,
  Medium,
  ModelViewId,
  RelationshipSubtype,
  TemperatureState,
} from '../model/types'

export type ViewId = ModelViewId

export type ObjectType = AssetType

export type RelationshipType = 'hierarchical' | 'directional'

export type LaneId = string

export interface GraphObject {
  id: string
  label: string
  type: ObjectType
  description?: string
  views: ViewId[]
  defaultGroups?: Partial<Record<ViewId, string>>
  tags?: string[]
}

export interface GraphRelationship {
  id: string
  source: string
  target: string
  type: RelationshipType
  views: ViewId[]
  lane?: LaneId
  subtype?: RelationshipSubtype
  medium?: Medium
  flowRole?: FlowRole
  temperatureState?: TemperatureState
  directionSemantics?: string
  notes?: string
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
