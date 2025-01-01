import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { mob, mobColor, map, mobMap } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "~/server/db";
import { setEquals, setIntersection } from "~/lib/utils";

const getTargetMob = (currentDay: number) => {
  return unstable_cache(async () => {
    const date = Date.now();
    console.log("fetched date", date);
    const id = 3110100;
    const targetMob = await db
      .select({
        id: mob.id,
        name: sql<string>`min(${mob.name})`,
        level: sql<number>`min(${mob.level})`,
        width: sql<number>`min(${mob.width})`,
        height: sql<number>`min(${mob.height})`,
        is_boss: sql<boolean>`bool_and(${mob.is_boss})`,
        colors: sql<string[]>`array_agg(${mobColor.color})`,
        mapMarks: sql<string[]>`array_agg(${map.mapMark})`,
      })
      .from(mob)
      .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
      .innerJoin(mobMap, eq(mob.id, mobMap.mobId))
      .innerJoin(map, eq(mobMap.mapId, map.id))
      .where(eq(mob.id, id))
      .groupBy(mob.id)
      .execute();
    if (!targetMob[0]) {
      return undefined;
    }
    console.log("targetMob1", targetMob);
    return {
      name: targetMob[0].name,
      level: targetMob[0].level,
      width: targetMob[0].width,
      height: targetMob[0].height,
      is_boss: targetMob[0].is_boss,
      colors: new Set(targetMob[0].colors),
      mapMarks: new Set(targetMob[0].mapMarks),
    };
  // }, [Date.now().toString()]);
  }, ["date", currentDay.toString()]);
};

export const mobRouter = createTRPCRouter({
  guessById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const minutesSinceEpoch = Math.floor(Date.now() / (1000 * 60));
      const targetMob = await getTargetMob(minutesSinceEpoch)();

      if (!targetMob) {
        return undefined;
      }
      console.log("input", input);

      const mobs = await ctx.db
        .select({
          id: mob.id,
          name: sql<string>`min(${mob.name})`,
          level: sql<number>`min(${mob.level})`,
          width: sql<number>`min(${mob.width})`,
          height: sql<number>`min(${mob.height})`,
          is_boss: sql<boolean>`bool_and(${mob.is_boss})`,
          colors: sql<string[]>`array_agg(${mobColor.color})`,
          mapMarks: sql<string[]>`array_agg(${map.mapMark})`,
          icon: sql<Buffer>`(array_agg(${mob.icon}))[1]`,
        })
        .from(mob)
        .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
        .innerJoin(mobMap, eq(mob.id, mobMap.mobId))
        .innerJoin(map, eq(mobMap.mapId, map.id))
        .where(eq(mob.id, input.id))
        .groupBy(mob.id)
        .execute();

      if (!mobs[0]) {
        return undefined;
      }

      const selectedMob = {
        name: mobs[0].name,
        level: mobs[0].level,
        width: mobs[0].width,
        height: mobs[0].height,
        is_boss: mobs[0].is_boss,
        colors: new Set(mobs[0].colors),
        mapMarks: new Set(mobs[0].mapMarks),
        icon: btoa(String.fromCharCode(...mobs[0].icon)),
      };
      console.log("targetMob", targetMob);
      console.log("selected mob", selectedMob);

      const grades = {
        correct: "correct",
        incorrect: "incorrect",
        lower: "lower",
        higher: "higher",
        partial: "partial",
      } as const;
      return {
        mob: selectedMob,
        grade: {
          name:
            selectedMob.name === targetMob.name
              ? grades.correct
              : grades.incorrect,
          level:
            selectedMob.level === targetMob.level
              ? grades.correct
              : selectedMob.level > targetMob.level
                ? grades.lower
                : grades.higher,
          width:
            selectedMob.width === targetMob.width
              ? grades.correct
              : selectedMob.width > targetMob.width
                ? grades.lower
                : grades.higher,
          height:
            selectedMob.height === targetMob.height
              ? grades.correct
              : selectedMob.height > targetMob.height
                ? grades.lower
                : grades.higher,
          is_boss:
            selectedMob.is_boss === targetMob.is_boss
              ? grades.correct
              : grades.incorrect,
          color: setEquals(selectedMob.colors, targetMob.colors)
            ? grades.correct
            : setIntersection(selectedMob.colors, targetMob.colors).size > 0
              ? grades.partial
              : grades.incorrect,
          mapMark: setEquals(selectedMob.mapMarks, targetMob.mapMarks)
            ? grades.correct
            : setIntersection(selectedMob.mapMarks, targetMob.mapMarks).size > 0
              ? grades.partial
              : grades.incorrect,
        },
      };
    }),
});
