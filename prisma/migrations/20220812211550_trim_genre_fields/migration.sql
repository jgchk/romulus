-- Trim leading/trailing spaces from name & description fields
UPDATE "Genre"
SET "name" = TRIM ("name"),
	"shortDescription" = TRIM ("shortDescription"),
	"longDescription" = TRIM ("longDescription");
