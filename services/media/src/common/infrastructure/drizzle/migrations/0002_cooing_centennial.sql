CREATE TABLE "media_artifact_relationship_type_children" (
	"media_artifact_relationship_type_id" text NOT NULL,
	"child_media_artifact_type_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_artifact_relationship_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_media_artifact_type_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_artifact_type_media_types" (
	"media_artifact_type_id" text NOT NULL,
	"media_type_id" text NOT NULL,
	CONSTRAINT "media_artifact_type_media_types_media_artifact_type_id_media_type_id_pk" PRIMARY KEY("media_artifact_type_id","media_type_id")
);
--> statement-breakpoint
CREATE TABLE "media_artifact_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_type_parents" ADD CONSTRAINT "media_type_parents_parent_id_child_id_pk" PRIMARY KEY("parent_id","child_id");--> statement-breakpoint
ALTER TABLE "media_artifact_relationship_type_children" ADD CONSTRAINT "media_artifact_relationship_type_children_media_artifact_relationship_type_id_media_artifact_relationship_types_id_fk" FOREIGN KEY ("media_artifact_relationship_type_id") REFERENCES "public"."media_artifact_relationship_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_artifact_relationship_type_children" ADD CONSTRAINT "media_artifact_relationship_type_children_child_media_artifact_type_id_media_artifact_types_id_fk" FOREIGN KEY ("child_media_artifact_type_id") REFERENCES "public"."media_artifact_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_artifact_relationship_types" ADD CONSTRAINT "media_artifact_relationship_types_parent_media_artifact_type_id_media_artifact_types_id_fk" FOREIGN KEY ("parent_media_artifact_type_id") REFERENCES "public"."media_artifact_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_artifact_type_media_types" ADD CONSTRAINT "media_artifact_type_media_types_media_artifact_type_id_media_artifact_types_id_fk" FOREIGN KEY ("media_artifact_type_id") REFERENCES "public"."media_artifact_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_artifact_type_media_types" ADD CONSTRAINT "media_artifact_type_media_types_media_type_id_media_types_id_fk" FOREIGN KEY ("media_type_id") REFERENCES "public"."media_types"("id") ON DELETE cascade ON UPDATE cascade;