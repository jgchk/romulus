import { serve } from "@hono/node-server";
import {
  CreateApiKeyCommand,
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
  WhoamiQuery,
} from "@romulus/authentication/application";
import { AuthenticationInfrastructure } from "@romulus/authentication/infrastructure";
import { AuthorizationInfrastructure } from "@romulus/authorization/infrastructure";
import { createAuthenticationRouter } from "@romulus/authentication/router";
import { createAuthorizationRouter } from "@romulus/authorization/router";
import { AuthorizationApplication } from "@romulus/authorization/application";
import { Hono } from "hono";

async function main() {
  const authenticationInfrastructure = new AuthenticationInfrastructure(
    "postgresql://postgres:postgres@localhost:5432/authentication",
  );

  const authorizationInfrastructure = new AuthorizationInfrastructure(
    "postgresql://postgres:postgres@localhost:5432/authorization",
  );

  const authenticationRouter = createAuthenticationRouter({
    loginCommand: () =>
      new LoginCommand(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.passwordHashRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
        authenticationInfrastructure.sessionTokenGenerator(),
      ),
    logoutCommand: () =>
      new LogoutCommand(
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    registerCommand: () =>
      new RegisterCommand(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.passwordHashRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
        authenticationInfrastructure.sessionTokenGenerator(),
      ),
    requestPasswordResetCommand: () =>
      new RequestPasswordResetCommand(
        authenticationInfrastructure.passwordResetTokenRepo(),
        authenticationInfrastructure.passwordResetTokenGenerator(),
        authenticationInfrastructure.passwordResetTokenHashRepo(),
        authenticationInfrastructure.accountRepo(),
        new AuthorizationApplication(
          authorizationInfrastructure.authorizerRepo(),
        ),
      ),
    resetPasswordCommand: () =>
      new ResetPasswordCommand(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.passwordResetTokenRepo(),
        authenticationInfrastructure.passwordResetTokenHashRepo(),
        authenticationInfrastructure.passwordHashRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
        authenticationInfrastructure.sessionTokenGenerator(),
      ),
    whoamiQuery: () =>
      new WhoamiQuery(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    getAccountQuery: () =>
      new GetAccountQuery(authenticationInfrastructure.accountRepo()),
    getAccountsQuery: () =>
      new GetAccountsQuery(authenticationInfrastructure.accountRepo()),
    refreshSessionCommand: () =>
      new RefreshSessionCommand(
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    createApiKeyCommand: () =>
      new CreateApiKeyCommand(
        authenticationInfrastructure.apiKeyRepo(),
        authenticationInfrastructure.apiKeyTokenGenerator(),
        authenticationInfrastructure.apiKeyHashRepo(),
      ),
    deleteApiKeyCommand: () =>
      new DeleteApiKeyCommand(authenticationInfrastructure.apiKeyRepo()),
    getApiKeysByAccountQuery: () =>
      new GetApiKeysByAccountQuery(authenticationInfrastructure.dbConnection()),
  });

  const authorizationRouter = createAuthorizationRouter({
    application: () =>
      new AuthorizationApplication(
        authorizationInfrastructure.authorizerRepo(),
      ),
    whoami: () =>
      new WhoamiQuery(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
  });

  const app = new Hono()
    .route("/authentication", authenticationRouter)
    .route("/authorization", authorizationRouter);

  serve(app, (info) => console.log(`Backend running on ${info.port}`));
}

void main();
