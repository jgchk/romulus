CREATE TABLE IF NOT EXISTS "media_type_children" (
	"media_type_tree_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	CONSTRAINT "media_type_children_media_type_tree_id_parent_id_child_id_pk" PRIMARY KEY("media_type_tree_id","parent_id","child_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_types" (
	"id" uuid NOT NULL,
	"media_type_tree_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "media_types_id_media_type_tree_id_pk" PRIMARY KEY("id","media_type_tree_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_type_trees" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"base_tree_id" uuid,
	"owner_id" integer NOT NULL,
	"is_main" boolean NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_type_children" ADD CONSTRAINT "media_type_children_media_type_tree_id_media_type_trees_id_fk" FOREIGN KEY ("media_type_tree_id") REFERENCES "public"."media_type_trees"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_type_children" ADD CONSTRAINT "media_type_children_parent_id_media_type_tree_id_media_types_id_media_type_tree_id_fk" FOREIGN KEY ("parent_id","media_type_tree_id") REFERENCES "public"."media_types"("id","media_type_tree_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_type_children" ADD CONSTRAINT "media_type_children_child_id_media_type_tree_id_media_types_id_media_type_tree_id_fk" FOREIGN KEY ("child_id","media_type_tree_id") REFERENCES "public"."media_types"("id","media_type_tree_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_types" ADD CONSTRAINT "media_types_media_type_tree_id_media_type_trees_id_fk" FOREIGN KEY ("media_type_tree_id") REFERENCES "public"."media_type_trees"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_type_trees" ADD CONSTRAINT "media_type_trees_base_tree_id_media_type_trees_id_fk" FOREIGN KEY ("base_tree_id") REFERENCES "public"."media_type_trees"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
