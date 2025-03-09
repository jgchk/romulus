import {
  CreateApiKeyCommand,
  DeleteAccountCommand,
  DeleteApiKeyCommand,
  GetAccountQuery,
  GetAccountsQuery,
  GetApiKeysByAccountQuery,
  LoginCommand,
  LogoutCommand,
  RefreshSessionCommand,
  RegisterCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
  ValidateApiKeyCommand,
  WhoamiQuery,
} from '@romulus/authentication/application'
import type { AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { AuthorizationApplication } from '@romulus/authorization/application'
import {
  CreateGenreCommand,
  DeleteGenreCommand,
  GetAllGenresQuery,
  GetGenreHistoryByAccountQuery,
  GetGenreHistoryQuery,
  GetGenreQuery,
  GetGenreRelevanceVoteByAccountQuery,
  GetGenreRelevanceVotesByGenreQuery,
  GetGenreTreeQuery,
  GetLatestGenreUpdatesQuery,
  GetRandomGenreIdQuery,
  UpdateGenreCommand,
  VoteGenreRelevanceCommand,
} from '@romulus/genres/application'
import {
  createDefineArtifactSchemaCommandHandler,
  createDefineRelationSchemaCommandHandler,
  createRegisterArtifactCommandHandler,
  createRegisterRelationCommandHandler,
} from '@romulus/media/artifacts/application'
import { UserSettingsApplication } from '@romulus/user-settings/application'

import type { Infrastructure } from './infrastructure.js'

export type AuthenticationApplication = ReturnType<typeof createAuthenticationApplication>

export function createAuthenticationApplication({
  infrastructure,
  authorizationService,
}: {
  infrastructure: AuthenticationInfrastructure
  authorizationService: {
    hasPermission: (userId: number, permission: string) => Promise<boolean>
  }
}) {
  return {
    loginCommand() {
      return new LoginCommand(
        infrastructure.accountRepo(),
        infrastructure.sessionRepo(),
        infrastructure.passwordHashRepo(),
        infrastructure.sessionTokenHashRepo(),
        infrastructure.sessionTokenGenerator(),
      )
    },
    logoutCommand() {
      return new LogoutCommand(infrastructure.sessionRepo(), infrastructure.sessionTokenHashRepo())
    },
    registerCommand() {
      return new RegisterCommand(
        infrastructure.accountRepo(),
        infrastructure.sessionRepo(),
        infrastructure.passwordHashRepo(),
        infrastructure.sessionTokenHashRepo(),
        infrastructure.sessionTokenGenerator(),
      )
    },
    deleteAccountCommand() {
      return new DeleteAccountCommand(infrastructure.accountRepo(), authorizationService)
    },
    requestPasswordResetCommand() {
      return new RequestPasswordResetCommand(
        infrastructure.passwordResetTokenRepo(),
        infrastructure.passwordResetTokenGenerator(),
        infrastructure.passwordResetTokenHashRepo(),
        infrastructure.accountRepo(),
        authorizationService,
      )
    },
    resetPasswordCommand() {
      return new ResetPasswordCommand(
        infrastructure.accountRepo(),
        infrastructure.sessionRepo(),
        infrastructure.passwordResetTokenRepo(),
        infrastructure.passwordResetTokenHashRepo(),
        infrastructure.passwordHashRepo(),
        infrastructure.sessionTokenHashRepo(),
        infrastructure.sessionTokenGenerator(),
      )
    },
    whoamiQuery() {
      return new WhoamiQuery(
        infrastructure.accountRepo(),
        infrastructure.sessionRepo(),
        infrastructure.sessionTokenHashRepo(),
      )
    },
    getAccountQuery() {
      return new GetAccountQuery(infrastructure.accountRepo())
    },
    getAccountsQuery() {
      return new GetAccountsQuery(infrastructure.accountRepo())
    },
    refreshSessionCommand() {
      return new RefreshSessionCommand(
        infrastructure.sessionRepo(),
        infrastructure.sessionTokenHashRepo(),
      )
    },
    createApiKeyCommand() {
      return new CreateApiKeyCommand(
        infrastructure.apiKeyRepo(),
        infrastructure.apiKeyTokenGenerator(),
        infrastructure.apiKeyHashRepo(),
      )
    },
    deleteApiKeyCommand() {
      return new DeleteApiKeyCommand(infrastructure.apiKeyRepo())
    },
    getApiKeysByAccountQuery() {
      return new GetApiKeysByAccountQuery(infrastructure.dbConnection())
    },
    validateApiKeyCommand() {
      return new ValidateApiKeyCommand(infrastructure.apiKeyRepo(), infrastructure.apiKeyHashRepo())
    },
  }
}

export function createAuthorizationApplication(infrastructure: Infrastructure) {
  return new AuthorizationApplication(infrastructure.authorization.authorizerRepo())
}

export function createGenresApplication(infrastructure: Infrastructure) {
  return {
    createGenreCommand() {
      return new CreateGenreCommand(
        infrastructure.genres.genreRepo(),
        infrastructure.genres.genreTreeRepo(),
        infrastructure.genres.genreHistoryRepo(),
        {
          hasPermission(userId, permission) {
            return createAuthorizationApplication(infrastructure).checkMyPermission(
              permission,
              userId,
            )
          },
        },
      )
    },
    deleteGenreCommand() {
      return new DeleteGenreCommand(
        infrastructure.genres.genreRepo(),
        infrastructure.genres.genreTreeRepo(),
        infrastructure.genres.genreHistoryRepo(),
        {
          hasPermission(userId, permission) {
            return createAuthorizationApplication(infrastructure).checkMyPermission(
              permission,
              userId,
            )
          },
        },
      )
    },
    updateGenreCommand() {
      return new UpdateGenreCommand(
        infrastructure.genres.genreRepo(),
        infrastructure.genres.genreTreeRepo(),
        infrastructure.genres.genreHistoryRepo(),
        {
          hasPermission(userId, permission) {
            return createAuthorizationApplication(infrastructure).checkMyPermission(
              permission,
              userId,
            )
          },
        },
      )
    },
    voteGenreRelevanceCommand() {
      return new VoteGenreRelevanceCommand(infrastructure.genres.genreRelevanceVoteRepo(), {
        hasPermission(userId, permission) {
          return createAuthorizationApplication(infrastructure).checkMyPermission(
            permission,
            userId,
          )
        },
      })
    },
    getAllGenresQuery() {
      return new GetAllGenresQuery(infrastructure.genres.dbConnection())
    },
    getGenreHistoryByAccountQuery() {
      return new GetGenreHistoryByAccountQuery(infrastructure.genres.dbConnection())
    },
    getGenreHistoryQuery() {
      return new GetGenreHistoryQuery(infrastructure.genres.dbConnection())
    },
    getGenreRelevanceVoteByAccountQuery() {
      return new GetGenreRelevanceVoteByAccountQuery(infrastructure.genres.dbConnection())
    },
    getGenreRelevanceVotesByGenreQuery() {
      return new GetGenreRelevanceVotesByGenreQuery(infrastructure.genres.dbConnection())
    },
    getGenreTreeQuery() {
      return new GetGenreTreeQuery(infrastructure.genres.dbConnection())
    },
    getGenreQuery() {
      return new GetGenreQuery(infrastructure.genres.dbConnection())
    },
    getLatestGenreUpdatesQuery() {
      return new GetLatestGenreUpdatesQuery(infrastructure.genres.dbConnection())
    },
    getRandomGenreIdQuery() {
      return new GetRandomGenreIdQuery(infrastructure.genres.dbConnection())
    },
  }
}

export function createMediaApplication(infrastructure: Infrastructure) {
  return {
    handleDefineArtifactSchemaCommand: createDefineArtifactSchemaCommandHandler((event) => {
      infrastructure.media.applyEvent(event)
    }),
    handleDefineRelationSchemaCommand: createDefineRelationSchemaCommandHandler((event) => {
      infrastructure.media.applyEvent(event)
    }),
    handleRegisterArtifactCommand: createRegisterArtifactCommandHandler(
      (id) => {
        return Promise.resolve(infrastructure.media.get().artifactSchemas.get(id))
      },
      (event) => {
        infrastructure.media.applyEvent(event)
      },
    ),
    handleRegisterRelationCommand: createRegisterRelationCommandHandler(
      (ids: { schemaId: string; sourceArtifactId: string; targetArtifactId: string }) => {
        const schema = infrastructure.media.get().relationSchemas.get(ids.schemaId)
        const sourceArtifact = infrastructure.media.get().artifacts.get(ids.sourceArtifactId)
        const targetArtifact = infrastructure.media.get().artifacts.get(ids.targetArtifactId)
        return Promise.resolve({ schema, sourceArtifact, targetArtifact })
      },
      (event) => {
        infrastructure.media.applyEvent(event)
      },
    ),
  }
}

export function createUserSettingsApplication(infrastructure: Infrastructure) {
  return new UserSettingsApplication(infrastructure.userSettings.userSettingsRepository())
}
