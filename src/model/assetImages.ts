const OBJECT_IMAGE_VERSION = 'detailed-20260617'

const IMAGE_ID_ALIASES: Record<string, string> = {
  lab_data_hall: 'lab',
  zone_pod: 'zone',
  hot_aisle_containment: 'hac',
  hot_aisle: 'hotAisleAir',
  server_node: 'serverNode',
  rack_unit_chassis: 'chassis',
  chiller_plant: 'chillerPlant',
  facility_supply_header: 'facilitySupplyHeader',
  facility_return_header: 'facilityReturnHeader',
  overhead_supply_header: 'overheadSupply',
  overhead_return_header: 'overheadReturn',
  row_branch_supply_manifold: 'rowBranchSupply',
  row_branch_return_manifold: 'rowBranchReturn',
  rack_supply_manifold: 'rackSupplyManifold',
  rack_return_manifold: 'rackReturnManifold',
  quick_disconnect_supply: 'quickDisconnect',
  quick_disconnect_return: 'quickDisconnect',
  cold_plate_gpu: 'coldPlate',
  cold_plate_cpu: 'coldPlate',
  crah_crac: 'crah',
  cold_supply_air: 'coldAisleAir',
  hot_exhaust_air: 'hotAisleAir',
  server_fans: 'serverFans',
  residual_component_heat: 'residualHeat',
  rack_pdu_a: 'rackPdu',
  rack_pdu_b: 'rackPdu',
  circuit_breaker: 'breaker',
  psu: 'psu',
  cdu: 'cdu',
  facility: 'facility',
  row: 'row',
  rack: 'rack',
  gpu: 'gpu',
}

export const imageForAssetId = (assetId: string) => {
  const imageId = IMAGE_ID_ALIASES[assetId]
  return imageId ? `/object-images/${imageId}.png?v=${OBJECT_IMAGE_VERSION}` : undefined
}
