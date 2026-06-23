import type { Edge, Node } from '@xyflow/react'
import { OBJECTS } from '../data/objects'
import { RELATIONSHIPS } from '../data/relationships'
import { getViewConfig } from '../data/views'
import { CANONICAL_MODEL } from '../model/source/markdownModel'
import { buildGraphEdges, buildGraphNodes } from '../model/toGraph'
import type { AppFilters, GraphObject, GraphRelationship, ObjectType, ViewId } from '../types/graph'
import { layoutFacility } from './layoutFacility'
import { layoutPower } from './layoutPower'
import { layoutThermal } from './layoutThermal'

export interface GraphBuildResult {
  nodes: Node[]
  edges: Edge[]
  visibleObjects: GraphObject[]
  visibleRelationships: GraphRelationship[]
  currentViewObjectCount: number
  relationshipTypeSummary: Record<string, number>
  availableTypes: ObjectType[]
}

export const buildGraphForView = (viewId: ViewId, filters: AppFilters): GraphBuildResult => {
  const viewConfig = getViewConfig(viewId)
  const searchTerm = filters.searchTerm.trim().toLowerCase()
  const relationshipsForViewBeforeFilters = RELATIONSHIPS.filter(
    (relationship) => relationship.views.includes(viewId) && relationship.type === viewConfig.relationshipType,
  )
  const endpointIdsForView = new Set<string>()
  relationshipsForViewBeforeFilters.forEach((relationship) => {
    endpointIdsForView.add(relationship.source)
    endpointIdsForView.add(relationship.target)
  })

  const currentViewObjects = OBJECTS.filter((object) => object.views.includes(viewId) || endpointIdsForView.has(object.id))
  const availableTypes = Array.from(new Set(currentViewObjects.map((object) => object.type))).sort()
  const allowedTypes = new Set(filters.activeTypeFilters)

  const visibleObjects = currentViewObjects.filter((object) => allowedTypes.has(object.type))
  const visibleObjectIds = new Set(visibleObjects.map((object) => object.id))
  const relationshipsForView = relationshipsForViewBeforeFilters.filter(
    (relationship) =>
      visibleObjectIds.has(relationship.source) &&
      visibleObjectIds.has(relationship.target),
  )

  const baseNodes: Node[] = buildGraphNodes(visibleObjects, viewId, CANONICAL_MODEL.groups, searchTerm)

  const laidOutNodes =
    viewConfig.layout === 'tree-vertical'
      ? layoutFacility(baseNodes, relationshipsForView)
      : viewConfig.layout === 'flow-horizontal'
        ? layoutPower(baseNodes)
        : layoutThermal(baseNodes)

  const edges: Edge[] = buildGraphEdges(relationshipsForView, viewId)

  const relationshipTypeSummary = relationshipsForView.reduce<Record<string, number>>((summary, relationship) => {
    summary[relationship.type] = (summary[relationship.type] ?? 0) + 1
    if (relationship.lane) summary[relationship.lane] = (summary[relationship.lane] ?? 0) + 1
    if (relationship.flowRole) summary[relationship.flowRole] = (summary[relationship.flowRole] ?? 0) + 1
    return summary
  }, {})

  return {
    nodes: laidOutNodes,
    edges,
    visibleObjects,
    visibleRelationships: relationshipsForView,
    currentViewObjectCount: currentViewObjects.length,
    relationshipTypeSummary,
    availableTypes,
  }
}
