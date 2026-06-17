import type { GraphRelationship } from '../types/graph'

export const FACILITY_RELATIONSHIPS: GraphRelationship[] = [
  { id: 'f1', source: 'facility', target: 'lab', type: 'hierarchical', views: ['facility'] },
  { id: 'f2', source: 'lab', target: 'zone', type: 'hierarchical', views: ['facility'] },
  { id: 'f3', source: 'zone', target: 'hac', type: 'hierarchical', views: ['facility'] },
  { id: 'f4', source: 'hac', target: 'aisle', type: 'hierarchical', views: ['facility'] },
  { id: 'f5', source: 'aisle', target: 'row', type: 'hierarchical', views: ['facility'] },
  { id: 'f6', source: 'row', target: 'rack', type: 'hierarchical', views: ['facility'] },
  { id: 'f7', source: 'rack', target: 'chassis', type: 'hierarchical', views: ['facility'] },
  { id: 'f8', source: 'chassis', target: 'serverNode', type: 'hierarchical', views: ['facility'] },
  { id: 'f9', source: 'serverNode', target: 'gpu', type: 'hierarchical', views: ['facility'] },
  { id: 'f10', source: 'lab', target: 'cdu', type: 'hierarchical', views: ['facility'] },
]

export const POWER_RELATIONSHIPS: GraphRelationship[] = [
  { id: 'p1', source: 'rpp', target: 'breaker', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p2', source: 'breaker', target: 'rackPdu', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p3', source: 'rackPdu', target: 'psu', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p4', source: 'psu', target: 'serverNode', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p5', source: 'serverNode', target: 'gpu', type: 'directional', views: ['power'], lane: 'power' },
  { id: 'p6', source: 'breaker', target: 'plc', type: 'directional', views: ['power'], lane: 'power', label: 'monitor/control' },
  { id: 'p7', source: 'plc', target: 'cdu', type: 'directional', views: ['power'], lane: 'power', label: 'power/control dependency' },
]

export const THERMAL_RELATIONSHIPS: GraphRelationship[] = [
  { id: 't1', source: 'chillerPlant', target: 'facilitySupplyHeader', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'facility' },
  { id: 't2', source: 'facilitySupplyHeader', target: 'cdu', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'facility' },
  { id: 't3', source: 'cdu', target: 'facilityReturnHeader', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'facility' },
  { id: 't4', source: 'facilityReturnHeader', target: 'chillerPlant', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'facility' },
  { id: 't5', source: 'cdu', target: 'overheadSupply', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't6', source: 'overheadSupply', target: 'rowBranchSupply', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't7', source: 'rowBranchSupply', target: 'rackSupplyManifold', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't8', source: 'rackSupplyManifold', target: 'quickDisconnect', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't9', source: 'quickDisconnect', target: 'serverNode', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't10', source: 'serverNode', target: 'coldPlate', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'coldSupply', loop: 'cdu-secondary' },
  { id: 't11', source: 'coldPlate', target: 'serverReturn', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't12', source: 'serverReturn', target: 'rackReturnManifold', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't13', source: 'rackReturnManifold', target: 'rowBranchReturn', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't14', source: 'rowBranchReturn', target: 'overheadReturn', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't15', source: 'overheadReturn', target: 'cdu', type: 'directional', views: ['thermal'], lane: 'liquid', thermalFlow: 'warmReturn', loop: 'cdu-secondary' },
  { id: 't16', source: 'crah', target: 'coldAisleAir', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
  { id: 't17', source: 'coldAisleAir', target: 'rack', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
  { id: 't18', source: 'rack', target: 'serverFans', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
  { id: 't19', source: 'serverFans', target: 'residualHeat', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
  { id: 't20', source: 'residualHeat', target: 'hotAisleAir', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
  { id: 't21', source: 'hotAisleAir', target: 'hac', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
  { id: 't22', source: 'hac', target: 'crah', type: 'directional', views: ['thermal'], lane: 'air', thermalFlow: 'air', loop: 'air' },
]

export const RELATIONSHIPS: GraphRelationship[] = [
  ...FACILITY_RELATIONSHIPS,
  ...POWER_RELATIONSHIPS,
  ...THERMAL_RELATIONSHIPS,
]
