export type Action<Parameter = void, Return = ActionReturn<Parameter>> = <Node extends HTMLElement>(
  node: Node,
  parameter: Parameter,
) => Return | void

type ActionReturn<Parameter> = {
  update?: (parameter: Parameter) => void
  destroy?: () => void
}
