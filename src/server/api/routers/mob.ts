import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  
} from "~/server/api/trpc";
import { mob } from "~/server/db/schema";

export const mobRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const mobs = await ctx.db.select({ name: mob.name }).from(mob);
    return mobs ?? null;
  }),
});
