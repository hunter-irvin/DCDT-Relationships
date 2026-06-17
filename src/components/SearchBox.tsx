import { Search } from 'lucide-react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Search</span>
      <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-500">
        <Search size={16} aria-hidden="true" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Find object label"
          type="search"
        />
      </span>
    </label>
  )
}
