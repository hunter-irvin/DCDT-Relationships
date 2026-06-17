import type { ViewConfig } from '../types/graph'

interface HeaderProps {
  activeView: ViewConfig
}

export function Header({ activeView }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-950">Data Center Relationships Visualizer</h1>
        <p className="text-sm text-slate-500">{activeView.label} view</p>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
        Viewer prototype
      </div>
    </header>
  )
}
