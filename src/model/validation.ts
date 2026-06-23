import type {
  AssetType,
  CanonicalModel,
  FlowRole,
  GroupType,
  Medium,
  ModelValidationIssue,
  RelationshipSubtype,
  RelationshipType,
  TemperatureState,
} from './types'

const ASSET_TYPES: AssetType[] = ['facility', 'space', 'layout', 'rack', 'compute', 'thermal', 'power', 'controls']
const GROUP_TYPES: GroupType[] = ['section', 'lane', 'zone']
const RELATIONSHIP_TYPES: RelationshipType[] = ['hierarchical', 'directional']
const RELATIONSHIP_SUBTYPES: RelationshipSubtype[] = [
  'contains',
  'liquid_flow',
  'air_flow',
  'power_flow',
  'backup_power_flow',
  'control_signal',
  'telemetry_signal',
  'dependency',
]
const MEDIA: Medium[] = ['water', 'coolant', 'air', 'electricity', 'control_signal', 'telemetry', 'none']
const FLOW_ROLES: FlowRole[] = ['supply', 'return', 'feed', 'backup_feed', 'exhaust', 'control', 'telemetry', 'dependency']
const TEMPERATURE_STATES: TemperatureState[] = ['cold', 'warm', 'hot', 'neutral']

export const validateModel = (model: CanonicalModel) => {
  const issues: ModelValidationIssue[] = []
  const viewIds = new Set(model.views.map((view) => view.id))
  const groupIds = new Set(model.groups.map((group) => group.id))
  const assetIds = new Set(model.assets.map((asset) => asset.id))
  const relationshipIds = new Set(model.relationships.map((relationship) => relationship.id))

  addDuplicateIssues(issues, 'view', model.views.map((view) => view.id))
  addDuplicateIssues(issues, 'group', model.groups.map((group) => group.id))
  addDuplicateIssues(issues, 'asset', model.assets.map((asset) => asset.id))
  addDuplicateIssues(issues, 'relationship', model.relationships.map((relationship) => relationship.id))

  model.groups.forEach((group) => {
    requireAllowed(issues, 'group type', group.type, GROUP_TYPES, group.id)
    if (!viewIds.has(group.viewId)) addError(issues, `Group references unknown view ${group.viewId}`, group.id)
    if (group.parentGroupId && !groupIds.has(group.parentGroupId)) addError(issues, `Group references unknown parent ${group.parentGroupId}`, group.id)
    if (!Number.isFinite(group.order)) addError(issues, 'Group order must be numeric', group.id)
  })

  model.assets.forEach((asset) => {
    requireAllowed(issues, 'asset type', asset.type, ASSET_TYPES, asset.id)
    asset.views.forEach((viewId) => {
      if (!viewIds.has(viewId)) addError(issues, `Asset references unknown view ${viewId}`, asset.id)
    })

    Object.entries(asset.defaultGroups).forEach(([viewId, groupId]) => {
      if (!viewIds.has(viewId as never)) addError(issues, `Asset default group references unknown view ${viewId}`, asset.id)
      if (groupId && groupId !== 'root' && !groupIds.has(groupId) && !assetIds.has(groupId)) {
        addWarning(issues, `Asset default group ${groupId} is not a known group or asset`, asset.id)
      }
    })
  })

  model.relationships.forEach((relationship) => {
    if (!relationshipIds.has(relationship.id)) addError(issues, 'Relationship ID is missing', relationship.id)
    if (!viewIds.has(relationship.viewId)) addError(issues, `Relationship references unknown view ${relationship.viewId}`, relationship.id)
    if (!assetIds.has(relationship.sourceAssetId)) {
      addError(issues, `Relationship source asset ${relationship.sourceAssetId} does not exist`, relationship.id)
    }
    if (!assetIds.has(relationship.targetAssetId)) {
      addError(issues, `Relationship target asset ${relationship.targetAssetId} does not exist`, relationship.id)
    }
    requireAllowed(issues, 'relationship type', relationship.type, RELATIONSHIP_TYPES, relationship.id)
    requireAllowed(issues, 'relationship subtype', relationship.subtype, RELATIONSHIP_SUBTYPES, relationship.id)
    requireAllowed(issues, 'medium', relationship.medium, MEDIA, relationship.id)
    requireAllowed(issues, 'flow role', relationship.flowRole, FLOW_ROLES, relationship.id)
    requireAllowed(issues, 'temperature state', relationship.temperatureState, TEMPERATURE_STATES, relationship.id)

    if (relationship.groupId && !groupIds.has(relationship.groupId)) {
      addError(issues, `Relationship group ${relationship.groupId} does not exist`, relationship.id)
    }

    const source = model.assets.find((asset) => asset.id === relationship.sourceAssetId)
    const target = model.assets.find((asset) => asset.id === relationship.targetAssetId)
    if (source && !source.views.includes(relationship.viewId)) {
      addWarning(issues, `Source asset is not declared visible in ${relationship.viewId}`, relationship.id)
    }
    if (target && !target.views.includes(relationship.viewId)) {
      addWarning(issues, `Target asset is not declared visible in ${relationship.viewId}`, relationship.id)
    }
  })

  return {
    errors: issues.filter((issue) => issue.severity === 'error'),
    warnings: issues.filter((issue) => issue.severity === 'warning'),
  }
}

export const assertValidModel = (model: CanonicalModel) => {
  const result = validateModel(model)
  if (result.errors.length > 0) {
    throw new Error(result.errors.map((issue) => issue.message).join('\n'))
  }
  return result
}

const addDuplicateIssues = (issues: ModelValidationIssue[], label: string, ids: string[]) => {
  const seen = new Set<string>()
  ids.forEach((id) => {
    if (seen.has(id)) addError(issues, `Duplicate ${label} ID: ${id}`, id)
    seen.add(id)
  })
}

const requireAllowed = <T extends string>(
  issues: ModelValidationIssue[],
  label: string,
  value: T,
  allowed: readonly T[],
  id: string,
) => {
  if (!allowed.includes(value)) addError(issues, `Invalid ${label}: ${value}`, id)
}

const addError = (issues: ModelValidationIssue[], message: string, id?: string) => {
  issues.push({ severity: 'error', message, id })
}

const addWarning = (issues: ModelValidationIssue[], message: string, id?: string) => {
  issues.push({ severity: 'warning', message, id })
}
