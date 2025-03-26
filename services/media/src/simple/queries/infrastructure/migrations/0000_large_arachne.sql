CREATE TABLE "media_type_parents" (
	"parent_id" text NOT NULL,
	"child_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parents" text[]
);
--> statement-breakpoint
ALTER TABLE "media_type_parents" ADD CONSTRAINT "media_type_parents_parent_id_media_types_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_types"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_type_parents" ADD CONSTRAINT "media_type_parents_child_id_media_types_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."media_types"("id") ON DELETE cascade ON UPDATE cascade;