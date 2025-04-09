export type MediaType = {
  id: string
  name: string
  parents: string[]
}

export type MediaArtifactType = {
  id: string
  name: string
  mediaTypes: string[]
}

export type MediaArtifactRelationshipType = {
  id: string
  name: string
  parentMediaArtifactType: string
  childMediaArtifactTypes: string[]
}
