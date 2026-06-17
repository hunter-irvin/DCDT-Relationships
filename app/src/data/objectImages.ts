import { OBJECTS } from './objects'

export const OBJECT_IMAGE_BY_ID = Object.fromEntries(
  OBJECTS.map((object) => [object.id, `/object-images/${object.id}.png`]),
) as Record<string, string>
