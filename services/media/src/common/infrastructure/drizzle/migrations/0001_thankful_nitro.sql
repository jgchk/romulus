CREATE TABLE "events" (
	"aggregate_id" text NOT NULL,
	"version" integer NOT NULL,
	"sequence" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"event_data" jsonb NOT NULL
);
