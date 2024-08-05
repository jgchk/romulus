CREATE TABLE IF NOT EXISTS "ApiKey" (
	"key_hash" text NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "ApiKey_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_account_id_Account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
