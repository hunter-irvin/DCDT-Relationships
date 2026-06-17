import type { Node } from '@xyflow/react'
import type { GraphRelationship } from '../types/graph'

export const layoutFacility = (nodes: Node[], relationships: GraphRelationship[]) => {
  const depthById = new Map<string, number>()
  const childrenBySource = new Map<string, string[]>()

  relationships.forEach((relationship) => {
    const children = childrenBySource.get(relationship.source) ?? []
    children.push(relationship.target)
    childrenBySource.set(relationship.source, children)
  })

  const visit = (id: string, depth: number) => {
    const currentDepth = depthById.get(id)
    if (currentDepth !== undefined && currentDepth <= depth) return
    depthById.set(id, depth)
    childrenBySource.get(id)?.forEach((childId) => visit(childId, depth + 1))
  }

  visit('facility', 0)

  nodes.forEach((node) => {
    if (!depthById.has(node.id)) depthById.set(node.id, 1)
  })

  const levels = new Map<number, Node[]>()
  nodes.forEach((node) => {
    const depth = depthById.get(node.id) ?? 0
    const level = levels.get(depth) ?? []
    level.push(node)
    levels.set(depth, level)
  })

  const xGap = 300
  const yGap = 215

  return nodes.map((node) => {
    const depth = depthById.get(node.id) ?? 0
    const level = levels.get(depth) ?? []
    const index = level.findIndex((levelNode) => levelNode.id === node.id)
    const x = (index - (level.length - 1) / 2) * xGap
    return { ...node, position: { x, y: depth * yGap } }
  })
}
