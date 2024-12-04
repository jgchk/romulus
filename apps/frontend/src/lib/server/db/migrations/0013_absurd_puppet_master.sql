ALTER TABLE "Session" DROP CONSTRAINT "Session_user_id_Account_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_Account_id_fk" FOREIGN KEY ("user_id") REFERENCES "Account"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
