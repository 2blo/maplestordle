import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_HOST + "/" + env.DATABASE,
  },
  tablesFilter: ["ms_*"],
} satisfies Config;
