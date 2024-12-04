ALTER TABLE "ApiKey" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ApiKey" ADD COLUMN "createdAt" timestamp (3) DEFAULT now() NOT NULL;