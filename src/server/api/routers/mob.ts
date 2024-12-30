import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { mob, mobColor } from "~/server/db/schema";
import { eq } from "drizzle-orm";
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
        name: mob.name,
        level: mob.level,
        width: mob.width,
        height: mob.height,
        is_boss: mob.is_boss,
        color: mobColor.color,
      })
      .from(mob)
      .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
      .where(eq(mob.id, id))
      .execute();
    if (!targetMob[0]) {
      return undefined;
    }
    return {
      name: targetMob[0].name,
      level: targetMob[0].level,
      width: targetMob[0].width,
      height: targetMob[0].height,
      is_boss: targetMob[0].is_boss,
      color1: targetMob[0].color,
      color2: targetMob[1]?.color,
    };
  }, ["date", currentDay.toString()]);
};

export const mobRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const mobs = await ctx.db
        .select({
          id: mob.id,
          name: mob.name,
          level: mob.level,
          width: mob.width,
          height: mob.height,
          is_boss: mob.is_boss,
          icon: mob.icon,
          color: mobColor.color,
          ratio: mobColor.ratio,
        })
        .from(mob)
        .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
        .where(eq(mob.id, input.id))
        .execute();

      if (!mobs[0]) {
        return undefined;
      }

      console.log(mobs[0]);

      return {
        name: mobs[0].name,
        level: mobs[0].level,
        width: mobs[0].width,
        height: mobs[0].height,
        is_boss: mobs[0].is_boss,
        color1: mobs[0].color,
        color2: mobs[1]?.color,
        icon: btoa(String.fromCharCode(...mobs[0].icon)),
      };
    }),
  guessById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const minutesSinceEpoch = Math.floor(Date.now() / (1000 * 60));
      const targetMob = await getTargetMob(minutesSinceEpoch)();

      if (!targetMob) {
        return undefined;
      }

      const mobs = await ctx.db
        .select({
          id: mob.id,
          name: mob.name,
          level: mob.level,
          width: mob.width,
          height: mob.height,
          is_boss: mob.is_boss,
          icon: mob.icon,
          color: mobColor.color,
          ratio: mobColor.ratio,
        })
        .from(mob)
        .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
        .where(eq(mob.id, input.id))
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
        color1: mobs[0].color,
        color2: mobs[1]?.color,
        icon: btoa(String.fromCharCode(...mobs[0].icon)),
      };
      console.log("targetMob", targetMob);
      console.log("selected mob", selectedMob);
      console.log("input", input);

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
          color: setEquals(
            new Set([selectedMob.color1, selectedMob.color2]),
            new Set([targetMob.color1, targetMob.color2]),
          )
            ? grades.correct
            : setIntersection(
                  new Set([selectedMob.color1, selectedMob.color2]),
                  new Set([targetMob.color1, targetMob.color2]),
                ).size > 0
              ? grades.partial
              : grades.incorrect,
        },
      };
    }),
});
