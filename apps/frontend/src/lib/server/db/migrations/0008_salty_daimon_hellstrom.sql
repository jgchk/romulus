DROP INDEX IF EXISTS "Account_username_key";--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_username_unique" UNIQUE("username");