import type { GraphRelationship, LaneId, ViewId } from '../types/graph'

export const edgeColorFor = (viewId: ViewId, lane?: LaneId, relationship?: GraphRelationship) => {
  if (viewId === 'facility') return '#94a3b8'
  if (relationship?.subtype === 'telemetry_signal') return '#7c3aed'
  if (relationship?.subtype === 'control_signal') return '#9333ea'
  if (relationship?.subtype === 'backup_power_flow') return '#ca8a04'
  if (relationship?.subtype === 'power_flow') return '#d97706'
  if (relationship?.subtype === 'air_flow' && relationship.flowRole === 'supply') return '#0f766e'
  if (relationship?.subtype === 'air_flow') return '#ea580c'
  if (relationship?.subtype === 'liquid_flow' && relationship.flowRole === 'return') return '#dc2626'
  if (relationship?.subtype === 'liquid_flow') return '#0284c7'
  if (lane?.includes('power')) return '#d97706'
  if (lane?.includes('air')) return '#0f766e'
  if (lane?.includes('liquid')) return '#0284c7'
  return '#64748b'
}
