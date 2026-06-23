import { modelToGraphObjects } from '../model/toGraph'
import type { ObjectType } from '../types/graph'

export const OBJECT_TYPE_LABELS: Record<ObjectType, string> = {
  facility: 'Facility',
  space: 'Space',
  layout: 'Layout',
  rack: 'Rack',
  compute: 'Compute',
  power: 'Power',
  thermal: 'Thermal',
  controls: 'Controls',
}

export const OBJECTS = modelToGraphObjects()
