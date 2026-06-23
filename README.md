# Data Center Relationships Visualizer

Interactive React prototype for visualizing data center facility, thermal chain, and power train relationships.

The app currently renders from the canonical Markdown model in:

```text
docs/thermal_chain_power_train_asset_relationship_model.md
```

That model is parsed, validated, and adapted into React Flow graph data at runtime.

## Run Locally

```powershell
npm install
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173/`.

Validate the canonical model:

```powershell
npm run model:validate
```

## Project Layout

- `src/model/` - Canonical model parser, validation, image resolution, and graph adapter.
- `src/` - React application source, graph rendering, data-derived compatibility exports, and layout logic.
- `public/object-images/` - transparent PNG equipment illustrations used inside graph nodes.
- `scripts/` - utility scripts, including object image generation.
- `docs/` - implementation plans, canonical data model spec, asset plan, original spec, and thermal update plan.
- `qa/` - local visual QA screenshots captured during development.
