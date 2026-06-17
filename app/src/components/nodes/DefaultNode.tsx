import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import type { ObjectType } from '../../types/graph'

interface DefaultNodeData extends Record<string, unknown> {
  label: string
  typeLabel: string
  objectType: ObjectType
  imageSrc?: string
  showImage?: boolean
  orientation: 'vertical' | 'horizontal'
  muted: boolean
  colors: {
    border: string
    bg: string
    text: string
    dot: string
  }
}

export function DefaultNode({ data, selected }: NodeProps) {
  const nodeData = data as DefaultNodeData
  const isVertical = nodeData.orientation === 'vertical'
  const hiddenHandleClass = '!h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none'

  return (
    <div
      className={`w-[230px] rounded-md border bg-white px-3 py-2 shadow-sm transition ${
        nodeData.muted ? 'opacity-30 grayscale' : 'opacity-100'
      } ${selected ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-white' : ''}`}
      style={{
        borderColor: selected ? '#0284c7' : nodeData.colors.border,
        background: nodeData.colors.bg,
        color: nodeData.colors.text,
      }}
    >
      <Handle type="target" position={isVertical ? Position.Top : Position.Left} className={hiddenHandleClass} />
      <div className="flex items-start gap-2">
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: nodeData.colors.dot }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <div className="break-words text-sm font-semibold leading-tight">{nodeData.label}</div>
          {nodeData.showImage && nodeData.imageSrc && (
            <div className="my-2 flex h-[104px] items-center justify-center rounded border border-slate-200 bg-white/70">
              <img src={nodeData.imageSrc} alt="" className="max-h-[96px] max-w-[136px] object-contain" draggable={false} />
            </div>
          )}
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {nodeData.typeLabel}
          </div>
        </div>
      </div>
      <Handle type="source" position={isVertical ? Position.Bottom : Position.Right} className={hiddenHandleClass} />
    </div>
  )
}
