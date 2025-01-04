CREATE TABLE IF NOT EXISTS "game"."ms_map_mark" (
	"name" varchar NOT NULL,
	"icon" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "map_mark_id_idx" ON "game"."ms_map_mark" USING btree ("name");