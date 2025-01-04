import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  customType,
  varchar,
  pgSchema,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { env } from "~/env";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

const schema = pgSchema(env.DATABASE_SCHEMA);
const game_schema = pgSchema(env.GAME_DATABASE_SCHEMA);

const tableWithPrefix = (name: string) => `ms_${name}`;

export const posts = schema.table(
  tableWithPrefix("post"),
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => [
    index("created_by_idx").on(example.createdById),
    index("name_idx").on(example.name),
  ],
);

export const users = schema.table(tableWithPrefix("user"), {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = schema.table(
  tableWithPrefix("account"),
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index("account_user_id_idx").on(account.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = schema.table(
  tableWithPrefix("session"),
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => [index("session_user_id_idx").on(session.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = schema.table(
  tableWithPrefix("verification_token"),
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

export const mob = game_schema.table(
  tableWithPrefix("mob"),
  {
    id: integer("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    level: integer("level").notNull(),
    is_boss: boolean("is_boss").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    icon: bytea("icon").notNull(),
  },
  (mob) => [index("mob_id_idx").on(mob.id)],
);

export const mobColor = game_schema.table(
  tableWithPrefix("mob_color"),
  {
    mobId: integer("mob_id")
      .notNull()
      .references(() => mob.id),
    color: varchar("color", { length: 255 }).notNull(),
    ratio: real("ratio").notNull(),
  },
  (mobColor) => [index("mob_color_mob_id_idx").on(mobColor.mobId)],
);

export const map = game_schema.table(
  tableWithPrefix("map"),
  {
    id: integer("id").primaryKey().notNull(),
    name: varchar("name"),
    streetName: varchar("street_name"),
    mapMark: varchar("map_mark").notNull(),
    returnMapId: integer("return_map_id").notNull(),
    backgroundMusic: varchar("background_music").notNull(),
  },
  (map) => [index("map_details_id_idx").on(map.id)],
);

export const mobMap = game_schema.table(
  tableWithPrefix("mob_map"),
  {
    mobId: integer("mob_id")
      .notNull()
      .references(() => mob.id),
    mapId: integer("map_id")
      .notNull()
      .references(() => map.id),
  },
  (mobMap) => [index("mob_map_mob_id_idx").on(mobMap.mobId)],
);

export const mapMark = game_schema.table(
  tableWithPrefix("map_mark"),
  {
    name: varchar("name").notNull(),
    icon: bytea("icon").notNull(),
  },
  (mapMark) => [index("map_mark_id_idx").on(mapMark.name)],
);
