CREATE TABLE "media_artifacts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"media_artifact_type_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_artifacts" ADD CONSTRAINT "media_artifacts_media_artifact_type_id_media_artifact_types_id_fk" FOREIGN KEY ("media_artifact_type_id") REFERENCES "public"."media_artifact_types"("id") ON DELETE cascade ON UPDATE cascade;