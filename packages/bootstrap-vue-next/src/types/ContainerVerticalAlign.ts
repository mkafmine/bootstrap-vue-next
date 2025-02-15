import type VerticalAlign from './VerticalAlign'

type ContainerVerticalAlign = Exclude<VerticalAlign, 'baseline' | 'text-top' | 'text-bottom'>

export default ContainerVerticalAlign
