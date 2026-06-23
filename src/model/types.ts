export type ModelViewId = 'facility' | 'thermal_chain' | 'power_train'

export type AssetType =
  | 'facility'
  | 'space'
  | 'layout'
  | 'rack'
  | 'compute'
  | 'thermal'
  | 'power'
  | 'controls'

export type RelationshipType = 'hierarchical' | 'directional'

export type RelationshipSubtype =
  | 'contains'
  | 'liquid_flow'
  | 'air_flow'
  | 'power_flow'
  | 'backup_power_flow'
  | 'control_signal'
  | 'telemetry_signal'
  | 'dependency'

export type Medium =
  | 'water'
  | 'coolant'
  | 'air'
  | 'electricity'
  | 'control_signal'
  | 'telemetry'
  | 'none'

export type FlowRole =
  | 'supply'
  | 'return'
  | 'feed'
  | 'backup_feed'
  | 'exhaust'
  | 'control'
  | 'telemetry'
  | 'dependency'

export type TemperatureState = 'cold' | 'warm' | 'hot' | 'neutral'

export type GroupType = 'section' | 'lane' | 'zone'

export interface ModelView {
  id: ModelViewId
  name: string
  purpose: string
  primaryRelationshipTypes: RelationshipType[]
  layoutStyle: 'tree-vertical' | 'flow-horizontal' | 'multi-lane-horizontal'
}

export interface ModelGroup {
  id: string
  viewId: ModelViewId
  label: string
  type: GroupType
  order: number
  parentGroupId?: string
  description?: string
}

export interface ModelAsset {
  id: string
  label: string
  type: AssetType
  views: ModelViewId[]
  defaultGroups: Partial<Record<ModelViewId, string>>
  description?: string
}

export interface ModelRelationship {
  id: string
  viewId: ModelViewId
  sourceAssetId: string
  targetAssetId: string
  type: RelationshipType
  subtype: RelationshipSubtype
  medium: Medium
  flowRole: FlowRole
  temperatureState: TemperatureState
  groupId?: string
  directionSemantics?: string
  label?: string
  notes?: string
}

export interface CanonicalModel {
  views: ModelView[]
  groups: ModelGroup[]
  assets: ModelAsset[]
  relationships: ModelRelationship[]
}

export interface ModelValidationIssue {
  severity: 'error' | 'warning'
  message: string
  id?: string
}

export interface ModelValidationResult {
  errors: ModelValidationIssue[]
  warnings: ModelValidationIssue[]
}
