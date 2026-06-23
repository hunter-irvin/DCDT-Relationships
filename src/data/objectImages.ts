import { imageForAssetId } from '../model/assetImages'
import { OBJECTS } from './objects'

export const OBJECT_IMAGE_BY_ID = Object.fromEntries(
  OBJECTS.map((object) => [object.id, imageForAssetId(object.id)]).filter((entry): entry is [string, string] => Boolean(entry[1])),
) as Record<string, string>
