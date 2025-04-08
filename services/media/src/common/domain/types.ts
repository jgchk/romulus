export type MediaType = {
  id: string
  name: string
  parents: string[]
}

export type MediaArtifactSchema = {
  id: string
  name: string
  parent: string | undefined
}
