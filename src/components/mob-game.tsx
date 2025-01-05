import { mob, mobMap, mobColor } from "~/server/db/schema";
import { db } from "~/server/db";
import { unstable_cache } from "next/cache";

import { MobGameInput } from "./mob-game-input";
import { eq, sql } from "drizzle-orm";

const mobNames = unstable_cache(async () => {
  const mobs = await db
    .select({ id: sql<number>`min(${mob.id})`, name: mob.name }) // Some mobs have the same name, take the one with the lowest id since its most likely the "original"
    .from(mob)
    .innerJoin(mobMap, eq(mob.id, mobMap.mobId))
    .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
    .groupBy(mob.name);
  console.log("fetched mobs", mobs);
  return mobs;
}, ["mob-names"]);

export async function MobGame() {
  return (
    <div>
      <MobGameInput mobs={await mobNames()} />
    </div>
  );
}
