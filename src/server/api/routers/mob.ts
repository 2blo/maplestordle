import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { mob, mobColor, map, mobMap, mapMark } from "~/server/db/schema";
import { eq, sql, countDistinct } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "~/server/db";
import { setEquals, setIntersection } from "~/lib/utils";

const getTargetMob = (currentDay: number) => {
  return unstable_cache(async () => {
    const date = Date.now();
    console.log("fetched date", date, currentDay);
    const targetMobSeed = "1";
    const nMobs = (
      await db
        .select({
          count: countDistinct(mob.name), // multiple mobs can have the same name, so we count distinct names instead of ids
        })
        .from(mob)
        .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
        .innerJoin(mobMap, eq(mob.id, mobMap.mobId))
        .innerJoin(map, eq(mobMap.mapId, map.id))
        .execute()
    )[0]?.count;

    console.log("nMobs", nMobs);

    if (nMobs === undefined) {
      throw new Error("No mobs found");
    }

    const targetRowNumber = (currentDay % nMobs) + 1;
    console.log("targetRowNumber", targetRowNumber);

    const hashedName = db
      .select({
        id: sql<number>`min(${mob.id})`.as("id"),
        name: mob.name,
        nameHash: sql<string>`md5(${mob.name} || ${targetMobSeed}::text)`.as(
          "nameHash",
        ),
      })
      .from(mob)
      .innerJoin(mobColor, eq(mob.id, mobColor.mobId))
      .innerJoin(mobMap, eq(mob.id, mobMap.mobId))
      .innerJoin(map, eq(mobMap.mapId, map.id))
      .groupBy(mob.name)
      .as("hashedName");

    const hashOrderedName = db
      .select({
        id: hashedName.id,
        rowNumber:
          sql<number>`cast(row_number() over (order by ${hashedName.nameHash}) as integer)`.as(
            "rowNumber",
          ),
      })
      .from(hashedName)
      .as("hashOrderedName");

    const targetMobId = (
      await db
        .select({
          id: hashOrderedName.id,
        })
        .from(hashOrderedName)
        .where(eq(hashOrderedName.rowNumber, targetRowNumber))
        .execute()
    )[0]?.id;

    console.log("targetMobId", targetMobId);

    if (targetMobId === undefined) {
      throw new Error("Failed to calculate target mob id");
    }

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
      .where(eq(mob.id, targetMobId))
      .groupBy(mob.id)
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
      colors: Array.from(new Set(targetMob[0].colors)),
      mapMarks: Array.from(new Set(targetMob[0].mapMarks)),
    };
    // }, [Date.now().toString()]);
  }, ["date", currentDay.toString()]);
};

const getMapMarks = () => {
  return unstable_cache(async () => {
    const mapMarks = await db
      .select({
        name: mapMark.name,
        icon: mapMark.icon,
      })
      .from(mapMark)
      .execute();
    const map = new Map(
      mapMarks.map((mapMark_) => [mapMark_.name, mapMark_.icon]),
    );
    console.log("fetched map marks", mapMarks.keys());
    return map;
  }, [Date.now().toString()]);
  // }, ["map-marks"]);
};

export const mobRouter = createTRPCRouter({
  guessById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      console.log("input", input);
      const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const targetMob = await getTargetMob(daysSinceEpoch)();
      console.log("targetMob", targetMob);
      const mapMarks = await getMapMarks()();
      console.log("mapMark keys", mapMarks.keys());
      if (!targetMob) {
        return undefined;
      }

      const mobs = await ctx.db
        .select({
          id: mob.id,
          name: sql<string>`min(${mob.name})`,
          level: sql<number>`min(${mob.level})`,
          width: sql<number>`min(${mob.width})`,
          height: sql<number>`min(${mob.height})`,
          is_boss: sql<boolean>`bool_and(${mob.is_boss})`,
          colors: sql<string[]>`array_agg(distinct ${mobColor.color})`,
          mapMarks: sql<string[]>`array_agg(distinct ${map.mapMark})`,
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
        mapMarks: mobs[0].mapMarks
          .map((name) => ({
            name: name,
            icon: btoa(String.fromCharCode(...(mapMarks.get(name) ?? []))),
          }))
          .filter((mapMark) => mapMark.icon),
        icon: btoa(String.fromCharCode(...mobs[0].icon)),
      };
      console.log("selected mob", {
        name: selectedMob.name,
        level: selectedMob.level,
        width: selectedMob.width,
        height: selectedMob.height,
        is_boss: selectedMob.is_boss,
        colors: selectedMob.colors,
        mapMarks: selectedMob.mapMarks.map((mapMark) => mapMark.name),
      });

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
          color: setEquals(selectedMob.colors, new Set(targetMob.colors))
            ? grades.correct
            : setIntersection(selectedMob.colors, new Set(targetMob.colors))
                  .size > 0
              ? grades.partial
              : grades.incorrect,
          mapMark: setEquals(
            new Set(selectedMob.mapMarks.map((mapMark_) => mapMark_.name)),
            new Set(targetMob.mapMarks),
          )
            ? grades.correct
            : setIntersection(
                  new Set(
                    selectedMob.mapMarks.map((mapMark_) => mapMark_.name),
                  ),
                  new Set(targetMob.mapMarks),
                ).size > 0
              ? grades.partial
              : grades.incorrect,
        },
      };
    }),
});
