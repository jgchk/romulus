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
import { type AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { AuthorizationApplication } from '@romulus/authorization/application'
import { type AuthorizationInfrastructure } from '@romulus/authorization/infrastructure'
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
import { type GenresInfrastructure } from '@romulus/genres/infrastructure'
import { UserSettingsApplication } from '@romulus/user-settings/application'
import { type UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'

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

export function createAuthorizationApplication(infrastructure: AuthorizationInfrastructure) {
  return new AuthorizationApplication(infrastructure.authorizerRepo())
}

export type GenresApplication = ReturnType<typeof createGenresApplication>
export function createGenresApplication({
  infrastructure,
  authorizationService,
}: {
  infrastructure: GenresInfrastructure
  authorizationService: {
    hasPermission: (userId: number, permission: string) => Promise<boolean>
  }
}) {
  return {
    createGenreCommand() {
      return new CreateGenreCommand(
        infrastructure.genreRepo(),
        infrastructure.genreTreeRepo(),
        infrastructure.genreHistoryRepo(),
        authorizationService,
      )
    },
    deleteGenreCommand() {
      return new DeleteGenreCommand(
        infrastructure.genreRepo(),
        infrastructure.genreTreeRepo(),
        infrastructure.genreHistoryRepo(),
        authorizationService,
      )
    },
    updateGenreCommand() {
      return new UpdateGenreCommand(
        infrastructure.genreRepo(),
        infrastructure.genreTreeRepo(),
        infrastructure.genreHistoryRepo(),
        authorizationService,
      )
    },
    voteGenreRelevanceCommand() {
      return new VoteGenreRelevanceCommand(
        infrastructure.genreRelevanceVoteRepo(),
        authorizationService,
      )
    },
    getAllGenresQuery() {
      return new GetAllGenresQuery(infrastructure.dbConnection())
    },
    getGenreHistoryByAccountQuery() {
      return new GetGenreHistoryByAccountQuery(infrastructure.dbConnection())
    },
    getGenreHistoryQuery() {
      return new GetGenreHistoryQuery(infrastructure.dbConnection())
    },
    getGenreRelevanceVoteByAccountQuery() {
      return new GetGenreRelevanceVoteByAccountQuery(infrastructure.dbConnection())
    },
    getGenreRelevanceVotesByGenreQuery() {
      return new GetGenreRelevanceVotesByGenreQuery(infrastructure.dbConnection())
    },
    getGenreTreeQuery() {
      return new GetGenreTreeQuery(infrastructure.dbConnection())
    },
    getGenreQuery() {
      return new GetGenreQuery(infrastructure.dbConnection())
    },
    getLatestGenreUpdatesQuery() {
      return new GetLatestGenreUpdatesQuery(infrastructure.dbConnection())
    },
    getRandomGenreIdQuery() {
      return new GetRandomGenreIdQuery(infrastructure.dbConnection())
    },
  }
}

export function createUserSettingsApplication(infrastructure: UserSettingsInfrastructure) {
  return new UserSettingsApplication(infrastructure.userSettingsRepository())
}
