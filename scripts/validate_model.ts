import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseMarkdownModel } from '../src/model/source/parseMarkdownModel'
import { validateModel } from '../src/model/validation'

const specPath = resolve('docs', 'thermal_chain_power_train_asset_relationship_model.md')
const model = parseMarkdownModel(readFileSync(specPath, 'utf8'))
const validation = validateModel(model)

const summary = {
  views: model.views.length,
  groups: model.groups.length,
  assets: model.assets.length,
  relationships: model.relationships.length,
  errors: validation.errors.length,
  warnings: validation.warnings.length,
}

console.log(JSON.stringify(summary, null, 2))

validation.warnings.forEach((issue) => {
  console.warn(`warning: ${issue.id ? `${issue.id}: ` : ''}${issue.message}`)
})

if (validation.errors.length > 0) {
  validation.errors.forEach((issue) => {
    console.error(`${issue.id ? `${issue.id}: ` : ''}${issue.message}`)
  })
  process.exit(1)
}
