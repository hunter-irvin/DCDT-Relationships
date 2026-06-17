import type { Node } from '@xyflow/react'

const LIQUID_ORDER = [
  'chillerPlant',
  'facilitySupplyHeader',
  'cdu',
  'facilityReturnHeader',
  'overheadSupply',
  'rowBranchSupply',
  'rackSupplyManifold',
  'quickDisconnect',
  'serverNode',
  'coldPlate',
  'serverReturn',
  'rackReturnManifold',
  'rowBranchReturn',
  'overheadReturn',
]

const AIR_ORDER = ['crah', 'coldAisleAir', 'rack', 'serverFans', 'residualHeat', 'hotAisleAir', 'hac']
const CONTROL_ORDER = ['plc']

export const layoutThermal = (nodes: Node[]) => {
  const xGap = 285
  const lanes = {
    facilityLoop: 40,
    cduLoop: 315,
    air: 610,
    controls: 880,
  }

  return nodes.map((node) => {
    if (['chillerPlant', 'facilitySupplyHeader', 'cdu', 'facilityReturnHeader'].includes(node.id)) {
      return { ...node, position: { x: LIQUID_ORDER.indexOf(node.id) * xGap, y: lanes.facilityLoop } }
    }

    if (LIQUID_ORDER.includes(node.id)) {
      return { ...node, position: { x: (LIQUID_ORDER.indexOf(node.id) - 2) * xGap + 120, y: lanes.cduLoop } }
    }

    if (AIR_ORDER.includes(node.id)) {
      return { ...node, position: { x: AIR_ORDER.indexOf(node.id) * xGap + 120, y: lanes.air } }
    }

    if (CONTROL_ORDER.includes(node.id)) {
      return { ...node, position: { x: CONTROL_ORDER.indexOf(node.id) * xGap + 120, y: lanes.controls } }
    }

    return { ...node, position: { x: 0, y: lanes.controls } }
  })
}
