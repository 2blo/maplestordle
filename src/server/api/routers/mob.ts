import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { mob, mobColor } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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
});
