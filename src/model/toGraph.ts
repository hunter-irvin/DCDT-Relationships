import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import { imageForAssetId } from './assetImages'
import { CANONICAL_MODEL } from './source/markdownModel'
import type { CanonicalModel, ModelGroup, ModelRelationship, ModelViewId } from './types'
import type { GraphObject, GraphRelationship, ViewConfig } from '../types/graph'
import { edgeColorFor } from '../graph/edgeStyles'
import { TYPE_COLORS } from '../graph/nodeStyles'

export const modelToGraphObjects = (model: CanonicalModel = CANONICAL_MODEL): GraphObject[] =>
  model.assets.map((asset) => ({
    id: asset.id,
    label: asset.label,
    type: asset.type,
    description: asset.description,
    views: asset.views,
    defaultGroups: asset.defaultGroups,
  }))

export const modelToGraphRelationships = (model: CanonicalModel = CANONICAL_MODEL): GraphRelationship[] =>
  model.relationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.sourceAssetId,
    target: relationship.targetAssetId,
    type: relationship.type,
    views: [relationship.viewId],
    lane: relationship.groupId,
    subtype: relationship.subtype,
    medium: relationship.medium,
    flowRole: relationship.flowRole,
    temperatureState: relationship.temperatureState,
    directionSemantics: relationship.directionSemantics,
    notes: relationship.notes,
  }))

export const modelToViewConfigs = (model: CanonicalModel = CANONICAL_MODEL): ViewConfig[] =>
  model.views.map((view) => ({
    id: view.id,
    label: view.name,
    relationshipType: view.primaryRelationshipTypes[0] ?? 'directional',
    layout: view.layoutStyle,
    lanes: model.groups
      .filter((group) => group.viewId === view.id && group.type === 'lane')
      .sort((a, b) => a.order - b.order)
      .map((group) => ({ id: group.id, label: group.label })),
  }))

export const buildGraphNodes = (
  objects: GraphObject[],
  viewId: ModelViewId,
  groups: ModelGroup[],
  searchTerm: string,
): Node[] => {
  const groupById = new Map(groups.map((group) => [group.id, group]))

  return objects.map((object) => {
    const groupId = object.defaultGroups?.[viewId]
    const group = groupId ? groupById.get(groupId) : undefined
    const isSearchMatch = !searchTerm || object.label.toLowerCase().includes(searchTerm)
    const colors = TYPE_COLORS[object.type]

    return {
      id: object.id,
      type: 'defaultNode',
      position: { x: 0, y: 0 },
      sourcePosition: viewId === 'facility' ? Position.Bottom : Position.Right,
      targetPosition: viewId === 'facility' ? Position.Top : Position.Left,
      data: {
        label: object.label,
        typeLabel: object.type,
        objectType: object.type,
        groupId,
        groupType: group?.type,
        groupOrder: group?.order,
        imageSrc: imageForAssetId(object.id),
        orientation: viewId === 'facility' ? 'vertical' : 'horizontal',
        muted: !isSearchMatch,
        colors,
      },
    }
  })
}

export const buildGraphEdges = (relationships: GraphRelationship[], viewId: ModelViewId): Edge[] =>
  relationships.map((relationship) => {
    const color = edgeColorFor(viewId, relationship.lane, relationship)
    const isDirectional = relationship.type === 'directional'

    return {
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      type: 'smartOrthogonal',
      animated: false,
      markerEnd: isDirectional
        ? {
            type: MarkerType.ArrowClosed,
            color,
            width: 18,
            height: 18,
          }
        : undefined,
      style: {
        stroke: color,
        strokeWidth: strokeWidthFor(relationship),
        strokeDasharray: dashFor(relationship),
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
        subtype: relationship.subtype,
        medium: relationship.medium,
        flowRole: relationship.flowRole,
        temperatureState: relationship.temperatureState,
        stroke: color,
        isDirectional,
      },
    }
  })

const strokeWidthFor = (relationship: ModelRelationship | GraphRelationship) => {
  if (relationship.type === 'hierarchical') return 1.8
  if (relationship.subtype === 'telemetry_signal' || relationship.subtype === 'control_signal') return 1.8
  if (relationship.subtype === 'liquid_flow') return 2.8
  return 2.3
}

const dashFor = (relationship: ModelRelationship | GraphRelationship) => {
  if (relationship.subtype === 'backup_power_flow' || relationship.subtype === 'control_signal') return '8 8'
  if (relationship.subtype === 'telemetry_signal') return '3 7'
  return undefined
}
