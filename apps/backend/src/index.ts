import { serve } from "@hono/node-server";
import { AuthenticationService } from "@romulus/authentication";
import { Hono } from "hono";

import { env } from "./env";

async function main() {
  const authenticationService = await AuthenticationService.create(
    env.AUTHENTICATION_DATABASE_URL,
  );

  const app = new Hono().route(
    "/authentication",
    authenticationService.getRouter(),
  );

  serve(app, (info) => {
    console.log(`Server running on ${info.port}`);
  });
}

void main();
