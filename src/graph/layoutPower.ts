import type { Node } from '@xyflow/react'
import { layoutByGroup } from './layoutByGroup'

export const layoutPower = (nodes: Node[]) => layoutByGroup(nodes)
