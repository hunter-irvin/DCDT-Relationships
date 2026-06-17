import type { ObjectType, ViewId } from '../types/graph'

export const TYPE_COLORS: Record<ObjectType, { border: string; bg: string; text: string; dot: string }> = {
  facility: { border: '#64748b', bg: '#f8fafc', text: '#334155', dot: '#64748b' },
  space: { border: '#64748b', bg: '#f8fafc', text: '#334155', dot: '#94a3b8' },
  containment: { border: '#475569', bg: '#f8fafc', text: '#1f2937', dot: '#475569' },
  layout: { border: '#64748b', bg: '#f8fafc', text: '#334155', dot: '#64748b' },
  rack: { border: '#0f766e', bg: '#f0fdfa', text: '#134e4a', dot: '#0f766e' },
  compute: { border: '#2563eb', bg: '#eff6ff', text: '#1e3a8a', dot: '#2563eb' },
  power: { border: '#d97706', bg: '#fffbeb', text: '#78350f', dot: '#f59e0b' },
  thermal: { border: '#0284c7', bg: '#f0f9ff', text: '#075985', dot: '#0284c7' },
  controls: { border: '#64748b', bg: '#f1f5f9', text: '#334155', dot: '#7c3aed' },
}

export const VIEW_ACCENTS: Record<ViewId, string> = {
  facility: '#475569',
  power: '#d97706',
  thermal: '#0284c7',
}
