export type MediaArtifactTypeTreeMap = Map<
  string,
  {
    id: string
    name: string
    relationships: { id: string; name: string; childMediaArtifactTypes: string[] }[]
  }
>
