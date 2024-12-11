CREATE TABLE IF NOT EXISTS "permissions" (
	"name" text PRIMARY KEY NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" text NOT NULL,
	"permission_name" text NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_name_pk" PRIMARY KEY("role_id","permission_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"name" text PRIMARY KEY NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" integer NOT NULL,
	"role_name" text NOT NULL,
	CONSTRAINT "user_roles_user_id_role_name_pk" PRIMARY KEY("user_id","role_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_name_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_name_permissions_name_fk" FOREIGN KEY ("permission_name") REFERENCES "public"."permissions"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_name_roles_name_fk" FOREIGN KEY ("role_name") REFERENCES "public"."roles"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
