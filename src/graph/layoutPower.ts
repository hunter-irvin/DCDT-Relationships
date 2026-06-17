import type { Node } from '@xyflow/react'

const POWER_ORDER = ['rpp', 'breaker', 'rackPdu', 'psu', 'serverNode', 'gpu', 'plc', 'cdu']

export const layoutPower = (nodes: Node[]) => {
  const xGap = 285
  const yBase = 80

  return nodes
    .slice()
    .sort((a, b) => POWER_ORDER.indexOf(a.id) - POWER_ORDER.indexOf(b.id))
    .map((node, index) => ({
      ...node,
      position: {
        x: index * xGap,
        y: node.id === 'plc' || node.id === 'cdu' ? yBase + 230 : yBase,
      },
    }))
}
