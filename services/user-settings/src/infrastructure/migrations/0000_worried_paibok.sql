CREATE TABLE IF NOT EXISTS "user_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"genreRelevanceFilter" integer NOT NULL,
	"showRelevanceTags" boolean NOT NULL,
	"showTypeTags" boolean NOT NULL,
	"showNsfw" boolean NOT NULL,
	"darkMode" boolean NOT NULL
);
