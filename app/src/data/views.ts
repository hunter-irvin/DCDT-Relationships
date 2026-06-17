import type { ViewConfig, ViewId } from '../types/graph'

export const VIEW_CONFIGS: ViewConfig[] = [
  {
    id: 'facility',
    label: 'Facility',
    relationshipType: 'hierarchical',
    layout: 'tree-vertical',
  },
  {
    id: 'power',
    label: 'Power Train',
    relationshipType: 'directional',
    layout: 'flow-horizontal',
    lanes: [{ id: 'power', label: 'Power Flow' }],
  },
  {
    id: 'thermal',
    label: 'Thermal Chain',
    relationshipType: 'directional',
    layout: 'multi-lane-horizontal',
    lanes: [
      { id: 'liquid', label: 'Liquid Cooling' },
      { id: 'air', label: 'Air Cooling' },
    ],
  },
]

export const getViewConfig = (viewId: ViewId) =>
  VIEW_CONFIGS.find((view) => view.id === viewId) ?? VIEW_CONFIGS[0]
