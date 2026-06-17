import { OBJECTS } from './objects'

const OBJECT_IMAGE_VERSION = 'detailed-20260617'

export const OBJECT_IMAGE_BY_ID = Object.fromEntries(
  OBJECTS.map((object) => [object.id, `/object-images/${object.id}.png?v=${OBJECT_IMAGE_VERSION}`]),
) as Record<string, string>
