import type { GraphRelationship, LaneId, ThermalFlow, ViewId } from '../types/graph'

const thermalFlowColor = (thermalFlow?: ThermalFlow) => {
  if (thermalFlow === 'coldSupply') return '#0284c7'
  if (thermalFlow === 'warmReturn') return '#dc2626'
  if (thermalFlow === 'air') return '#0f766e'
  return undefined
}

export const edgeColorFor = (viewId: ViewId, lane?: LaneId, relationship?: GraphRelationship) => {
  if (viewId === 'facility') return '#94a3b8'
  if (viewId === 'power') return '#d97706'
  const flowColor = thermalFlowColor(relationship?.thermalFlow)
  if (flowColor) return flowColor
  if (lane === 'air') return '#0f766e'
  if (lane === 'liquid') return '#0284c7'
  return '#64748b'
}
