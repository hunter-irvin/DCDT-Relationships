import { modelToViewConfigs } from '../model/toGraph'
import type { ViewId } from '../types/graph'

export const VIEW_CONFIGS = modelToViewConfigs()

export const getViewConfig = (viewId: ViewId) =>
  VIEW_CONFIGS.find((view) => view.id === viewId) ?? VIEW_CONFIGS[0]
