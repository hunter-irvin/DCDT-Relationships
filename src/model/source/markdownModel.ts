import modelMarkdown from '../../../docs/thermal_chain_power_train_asset_relationship_model.md?raw'
import { validateModel } from '../validation'
import { parseMarkdownModel } from './parseMarkdownModel'

export const CANONICAL_MODEL = parseMarkdownModel(modelMarkdown)
export const CANONICAL_MODEL_VALIDATION = validateModel(CANONICAL_MODEL)
