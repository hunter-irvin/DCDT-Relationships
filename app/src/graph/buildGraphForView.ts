import type { Edge, Node } from '@xyflow/react'
import { MarkerType, Position } from '@xyflow/react'
import { OBJECTS, OBJECT_TYPE_LABELS } from '../data/objects'
import { OBJECT_IMAGE_BY_ID } from '../data/objectImages'
import { RELATIONSHIPS } from '../data/relationships'
import { getViewConfig } from '../data/views'
import type { AppFilters, GraphObject, GraphRelationship, ObjectType, ViewId } from '../types/graph'
import { edgeColorFor } from './edgeStyles'
import { layoutFacility } from './layoutFacility'
import { layoutPower } from './layoutPower'
import { layoutThermal } from './layoutThermal'
import { TYPE_COLORS } from './nodeStyles'

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
  const currentViewObjects = OBJECTS.filter((object) => object.views.includes(viewId))
  const availableTypes = Array.from(new Set(currentViewObjects.map((object) => object.type))).sort()
  const allowedTypes = new Set(filters.activeTypeFilters)

  const visibleObjects = currentViewObjects.filter((object) => allowedTypes.has(object.type))
  const visibleObjectIds = new Set(visibleObjects.map((object) => object.id))
  const relationshipsForView = RELATIONSHIPS.filter(
    (relationship) =>
      relationship.views.includes(viewId) &&
      relationship.type === viewConfig.relationshipType &&
      visibleObjectIds.has(relationship.source) &&
      visibleObjectIds.has(relationship.target),
  )

  const baseNodes: Node[] = visibleObjects.map((object) => {
    const isSearchMatch = !searchTerm || object.label.toLowerCase().includes(searchTerm)
    const colors = TYPE_COLORS[object.type]

    return {
      id: object.id,
      type: 'defaultNode',
      position: { x: 0, y: 0 },
      sourcePosition: viewConfig.layout === 'tree-vertical' ? Position.Bottom : Position.Right,
      targetPosition: viewConfig.layout === 'tree-vertical' ? Position.Top : Position.Left,
      data: {
        label: object.label,
        typeLabel: OBJECT_TYPE_LABELS[object.type],
        objectType: object.type,
        imageSrc: OBJECT_IMAGE_BY_ID[object.id],
        orientation: viewConfig.layout === 'tree-vertical' ? 'vertical' : 'horizontal',
        muted: !isSearchMatch,
        colors,
      },
    }
  })

  const laidOutNodes =
    viewConfig.layout === 'tree-vertical'
      ? layoutFacility(baseNodes, relationshipsForView)
      : viewConfig.layout === 'flow-horizontal'
        ? layoutPower(baseNodes)
        : layoutThermal(baseNodes)

  const edges: Edge[] = relationshipsForView.map((relationship) => {
    const color = edgeColorFor(viewId, relationship.lane, relationship)

    return {
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      label: relationship.label,
      type: 'smartOrthogonal',
      animated: false,
      markerEnd:
        relationship.type === 'directional'
          ? {
              type: MarkerType.ArrowClosed,
              color,
              width: 18,
              height: 18,
            }
          : undefined,
      style: {
        stroke: color,
        strokeWidth: viewId === 'thermal' ? 2.8 : relationship.type === 'directional' ? 2.3 : 1.8,
      },
      labelStyle: {
        fill: '#475569',
        fontSize: 12,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.9,
      },
      data: {
        lane: relationship.lane,
        thermalFlow: relationship.thermalFlow,
        loop: relationship.loop,
        stroke: color,
        isDirectional: relationship.type === 'directional',
      },
    }
  })

  const relationshipTypeSummary = relationshipsForView.reduce<Record<string, number>>((summary, relationship) => {
    summary[relationship.type] = (summary[relationship.type] ?? 0) + 1
    if (relationship.lane) summary[relationship.lane] = (summary[relationship.lane] ?? 0) + 1
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
