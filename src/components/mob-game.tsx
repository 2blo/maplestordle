import { mob } from "~/server/db/schema";
import { db } from "~/server/db";
import { unstable_cache } from "next/cache";

import { MobGameInput } from "./mob-game-input";

const mobNames = unstable_cache(async () => {
  const mobs = await db.select({ id: mob.id, name: mob.name }).from(mob);
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
