CREATE TABLE IF NOT EXISTS "game"."ms_map" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar,
	"street_name" varchar,
	"map_mark" varchar NOT NULL,
	"return_map_id" integer NOT NULL,
	"background_music" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game"."ms_mob_map" (
	"mob_id" integer NOT NULL,
	"map_id" integer NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS "mob_name_idx";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game"."ms_mob_map" ADD CONSTRAINT "ms_mob_map_mob_id_ms_mob_id_fk" FOREIGN KEY ("mob_id") REFERENCES "game"."ms_mob"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game"."ms_mob_map" ADD CONSTRAINT "ms_mob_map_map_id_ms_map_id_fk" FOREIGN KEY ("map_id") REFERENCES "game"."ms_map"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "map_details_id_idx" ON "game"."ms_map" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mob_map_mob_id_idx" ON "game"."ms_mob_map" USING btree ("mob_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mob_id_idx" ON "game"."ms_mob" USING btree ("id");