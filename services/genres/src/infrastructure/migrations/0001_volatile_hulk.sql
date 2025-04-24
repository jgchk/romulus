-- Custom SQL migration file, put your code below! --
CREATE INDEX idx_genre_name_covering ON "Genre" ("name" ASC) INCLUDE ("id", "subtitle", "type", "relevance", "nsfw", "updatedAt");
