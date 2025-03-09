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

export function createAuthenticationApplication(infrastructure: Infrastructure) {
  const authorization = {
    hasPermission(userId: number, permission: string) {
      return createAuthorizationApplication(infrastructure).checkMyPermission(permission, userId)
    },
  }

  return {
    loginCommand() {
      return new LoginCommand(
        infrastructure.authentication.accountRepo(),
        infrastructure.authentication.sessionRepo(),
        infrastructure.authentication.passwordHashRepo(),
        infrastructure.authentication.sessionTokenHashRepo(),
        infrastructure.authentication.sessionTokenGenerator(),
      )
    },
    logoutCommand() {
      return new LogoutCommand(
        infrastructure.authentication.sessionRepo(),
        infrastructure.authentication.sessionTokenHashRepo(),
      )
    },
    registerCommand() {
      return new RegisterCommand(
        infrastructure.authentication.accountRepo(),
        infrastructure.authentication.sessionRepo(),
        infrastructure.authentication.passwordHashRepo(),
        infrastructure.authentication.sessionTokenHashRepo(),
        infrastructure.authentication.sessionTokenGenerator(),
      )
    },
    deleteAccountCommand() {
      return new DeleteAccountCommand(infrastructure.authentication.accountRepo(), authorization)
    },
    requestPasswordResetCommand() {
      return new RequestPasswordResetCommand(
        infrastructure.authentication.passwordResetTokenRepo(),
        infrastructure.authentication.passwordResetTokenGenerator(),
        infrastructure.authentication.passwordResetTokenHashRepo(),
        infrastructure.authentication.accountRepo(),
        authorization,
      )
    },
    resetPasswordCommand() {
      return new ResetPasswordCommand(
        infrastructure.authentication.accountRepo(),
        infrastructure.authentication.sessionRepo(),
        infrastructure.authentication.passwordResetTokenRepo(),
        infrastructure.authentication.passwordResetTokenHashRepo(),
        infrastructure.authentication.passwordHashRepo(),
        infrastructure.authentication.sessionTokenHashRepo(),
        infrastructure.authentication.sessionTokenGenerator(),
      )
    },
    whoamiQuery() {
      return new WhoamiQuery(
        infrastructure.authentication.accountRepo(),
        infrastructure.authentication.sessionRepo(),
        infrastructure.authentication.sessionTokenHashRepo(),
      )
    },
    getAccountQuery() {
      return new GetAccountQuery(infrastructure.authentication.accountRepo())
    },
    getAccountsQuery() {
      return new GetAccountsQuery(infrastructure.authentication.accountRepo())
    },
    refreshSessionCommand() {
      return new RefreshSessionCommand(
        infrastructure.authentication.sessionRepo(),
        infrastructure.authentication.sessionTokenHashRepo(),
      )
    },
    createApiKeyCommand() {
      return new CreateApiKeyCommand(
        infrastructure.authentication.apiKeyRepo(),
        infrastructure.authentication.apiKeyTokenGenerator(),
        infrastructure.authentication.apiKeyHashRepo(),
      )
    },
    deleteApiKeyCommand() {
      return new DeleteApiKeyCommand(infrastructure.authentication.apiKeyRepo())
    },
    getApiKeysByAccountQuery() {
      return new GetApiKeysByAccountQuery(infrastructure.authentication.dbConnection())
    },
    validateApiKeyCommand() {
      return new ValidateApiKeyCommand(
        infrastructure.authentication.apiKeyRepo(),
        infrastructure.authentication.apiKeyHashRepo(),
      )
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
