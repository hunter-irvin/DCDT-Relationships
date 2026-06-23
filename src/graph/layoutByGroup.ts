import type { Node } from '@xyflow/react'

interface GroupLayoutData {
  groupId?: string
  groupType?: string
  groupOrder?: number
}

export const layoutByGroup = (nodes: Node[]) => {
  const groupedNodes = new Map<string, Node[]>()

  nodes.forEach((node) => {
    const data = node.data as GroupLayoutData
    const key = data.groupId ?? 'ungrouped'
    const group = groupedNodes.get(key) ?? []
    group.push(node)
    groupedNodes.set(key, group)
  })

  return nodes.map((node) => {
    const data = node.data as GroupLayoutData
    const groupKey = data.groupId ?? 'ungrouped'
    const group = groupedNodes.get(groupKey) ?? [node]
    const index = group.findIndex((groupNode) => groupNode.id === node.id)
    const order = Number.isFinite(data.groupOrder) ? Number(data.groupOrder) : groupedNodes.size + 1
    const isLane = data.groupType === 'lane'

    return {
      ...node,
      position: isLane
        ? {
            x: index * 285,
            y: 80 + (order - 1) * 210,
          }
        : {
            x: (order - 1) * 285,
            y: 80 + index * 132,
          },
    }
  })
}
