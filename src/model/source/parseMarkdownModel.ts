import type {
  AssetType,
  CanonicalModel,
  FlowRole,
  GroupType,
  Medium,
  ModelAsset,
  ModelGroup,
  ModelRelationship,
  ModelView,
  ModelViewId,
  RelationshipSubtype,
  RelationshipType,
  TemperatureState,
} from '../types'

const VIEW_ID_MAP: Record<string, ModelViewId> = {
  facility: 'facility',
  thermal_chain: 'thermal_chain',
  power_train: 'power_train',
}

const LAYOUT_STYLE_MAP: Record<string, ModelView['layoutStyle']> = {
  'top-down tree': 'tree-vertical',
  'horizontal flow': 'flow-horizontal',
  'multi-lane horizontal': 'multi-lane-horizontal',
}

const RELATIONSHIP_TYPE_MAP: Record<string, RelationshipType> = {
  hierarchical: 'hierarchical',
  directional: 'directional',
}

export const parseMarkdownModel = (markdown: string): CanonicalModel => ({
  views: parseViews(markdown),
  groups: [...parseGroups(markdown, '4.1 Thermal Chain Groups'), ...parseGroups(markdown, '4.2 Power Train Groups')],
  assets: [
    ...parseAssets(markdown, '5.1 Shared Physical and IT Assets'),
    ...parseAssets(markdown, '5.2 Thermal Chain Assets'),
    ...parseAssets(markdown, '5.3 Power Train Assets'),
  ],
  relationships: [
    ...parseRelationships(markdown, '6. Facility Hierarchy Seed Relationships'),
    ...parseRelationships(markdown, '7.1 Liquid Cooling Supply and Return'),
    ...parseRelationships(markdown, '7.2 Air Cooling Supply and Return'),
    ...parseRelationships(markdown, '7.3 Thermal Controls, Sensors, and Alarms'),
    ...parseRelationships(markdown, '8.1 Simplified Primary Power Feed'),
    ...parseRelationships(markdown, '8.2 Simplified Redundant / B-Side Rack Feed'),
    ...parseRelationships(markdown, '8.3 Backup / Standby Power Path'),
    ...parseRelationships(markdown, '8.4 Power Train Controls, Metering, and Shared Dependencies'),
  ],
})

const parseViews = (markdown: string): ModelView[] =>
  parseTableRows(sectionFor(markdown, '3.1 Views')).map((cells) => ({
    id: parseViewId(cells[0]),
    name: cells[1],
    purpose: cells[2],
    primaryRelationshipTypes: cells[3]
      .split(',')
      .map((value) => parseRelationshipType(value))
      .filter(isRelationshipType),
    layoutStyle: LAYOUT_STYLE_MAP[normalize(cells[4])] ?? 'flow-horizontal',
  }))

const parseGroups = (markdown: string, heading: string): ModelGroup[] =>
  parseTableRows(sectionFor(markdown, heading)).map((cells) => ({
    id: cells[0],
    viewId: parseViewId(cells[1]),
    label: cells[2],
    type: cells[3] as GroupType,
    order: Number(cells[4]),
    parentGroupId: optional(cells[5]),
    description: optional(cells[6]),
  }))

const parseAssets = (markdown: string, heading: string): ModelAsset[] =>
  parseTableRows(sectionFor(markdown, heading)).map((cells) => ({
    id: cells[0],
    label: cells[1],
    type: cells[2] as AssetType,
    views: cells[3].split(',').map((viewId) => parseViewId(viewId)),
    defaultGroups: parseDefaultGroups(cells[4]),
    description: optional(cells[5]),
  }))

const parseRelationships = (markdown: string, heading: string): ModelRelationship[] =>
  parseTableRows(sectionFor(markdown, heading)).map((cells) => ({
    id: cells[0],
    viewId: parseViewId(cells[1]),
    sourceAssetId: cells[2],
    targetAssetId: cells[3],
    type: parseRelationshipType(cells[4]) ?? 'directional',
    subtype: cells[5] as RelationshipSubtype,
    medium: cells[6] as Medium,
    flowRole: cells[7] as FlowRole,
    temperatureState: cells[8] as TemperatureState,
    groupId: optional(cells[9]),
    directionSemantics: optional(cells[10]),
    notes: optional(cells[11]),
  }))

const parseDefaultGroups = (value: string): Partial<Record<ModelViewId, string>> => {
  const groups: Partial<Record<ModelViewId, string>> = {}

  value.split(';').forEach((entry) => {
    const [rawViewId, rawGroupId] = entry.split(':').map((part) => part?.trim())
    if (!rawViewId || !rawGroupId) return
    groups[parseViewId(rawViewId)] = rawGroupId
  })

  return groups
}

const sectionFor = (markdown: string, heading: string) => {
  const escapedHeading = escapeRegExp(heading)
  const match = markdown.match(new RegExp(`^#{2,3} ${escapedHeading}\\s*$`, 'm'))
  if (!match || match.index === undefined) {
    throw new Error(`Could not find Markdown section: ${heading}`)
  }

  const start = match.index + match[0].length
  const rest = markdown.slice(start)
  const nextHeading = rest.search(/^#{2,3} /m)
  return nextHeading === -1 ? rest : rest.slice(0, nextHeading)
}

const parseTableRows = (section: string) =>
  section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && !line.includes('---'))
    .map(splitTableRow)
    .filter((cells) => cells.length > 0 && cells[0] !== 'View ID' && cells[0] !== 'Group ID' && cells[0] !== 'Asset ID')
    .filter((cells) => cells[0] !== 'Relationship ID')

const splitTableRow = (line: string) =>
  line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cleanCell(cell))

const cleanCell = (cell: string) =>
  cell
    .trim()
    .replace(/^`|`$/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')

const parseViewId = (value: string): ModelViewId => {
  const viewId = VIEW_ID_MAP[normalize(value)]
  if (!viewId) throw new Error(`Unknown view ID: ${value}`)
  return viewId
}

const parseRelationshipType = (value: string): RelationshipType | undefined => RELATIONSHIP_TYPE_MAP[normalize(value)]

const isRelationshipType = (value: RelationshipType | undefined): value is RelationshipType => value !== undefined

const optional = (value: string) => {
  const trimmed = value.trim()
  return trimmed && trimmed !== '-' ? trimmed : undefined
}

const normalize = (value: string) => value.trim().replace(/^`|`$/g, '').toLowerCase()

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
