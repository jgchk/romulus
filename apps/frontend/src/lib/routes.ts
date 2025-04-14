export const routes = {
  media: {
    types: {
      route: () => '/media/types',
      create: {
        route: () => `${routes.media.types.route()}/create`,
      },
      details: {
        route: (id: string) => `${routes.media.types.route()}/${id}`,
      },
    },
    artifactTypes: {
      route: () => '/media/artifact-types',
      create: {
        route: () => `${routes.media.artifactTypes.route()}/create`,
      },
      details: {
        edit: {
          route: (id: string) => `${routes.media.artifactTypes.route()}/${id}/edit`,
        },
        delete: {
          route: (id: string) => `${routes.media.artifactTypes.route()}/${id}/delete`,
        },
      },
      relationships: {
        route: () => `/media/artifact-relationship-types`,
        create: {
          route: () => `${routes.media.artifactTypes.relationships.route()}/create`,
        },
        details: {
          edit: {
            route: (id: string) => `${routes.media.artifactTypes.relationships.route()}/${id}/edit`,
          },
        },
      },
    },
  },
}
