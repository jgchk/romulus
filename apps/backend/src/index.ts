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
import { createAuthenticationRouter } from "@romulus/authentication/router";
import { Hono } from "hono";

async function main() {
  const authenticationInfrastructure = new AuthenticationInfrastructure(
    "postgresql://postgres:postgres@localhost:5432/authentication",
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
    requestPasswordResetCommand: (sessionToken) =>
      new RequestPasswordResetCommand(
        authenticationInfrastructure.passwordResetTokenRepo(),
        authenticationInfrastructure.passwordResetTokenGenerator(),
        authenticationInfrastructure.passwordResetTokenHashRepo(),
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.authorization(sessionToken),
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

  const app = new Hono().route("/authentication", authenticationRouter);

  serve(app, (info) => {
    console.log(`Authentication server running on ${info.port}`);
  });
}

void main();
