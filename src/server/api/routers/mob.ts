import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { mob } from "~/server/db/schema";
import { eq, is } from "drizzle-orm";
import { MySqlDateColumnBaseBuilder } from "drizzle-orm/mysql-core/columns/date.common";
import { db } from "~/server/db";
import { Icon } from "lucide-react";

export const mobRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const mobs = await ctx.db.select().from(mob);

      if (!mobs[0]) {
        return undefined;
      }
      return {
        name: mobs[0].name,
        level: mobs[0].level,
        width: mobs[0].width,
        height: mobs[0].height,
        is_boss: mobs[0].is_boss,
        icon: btoa(String.fromCharCode(...mobs[0].icon)),
      };
    }),
});
