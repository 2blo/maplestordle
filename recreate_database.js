import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { env } from "~/env";

const admin_db = drizzle(env.DATABASE_HOST + "/" + env.ADMIN_DATABASE);

const rl = readline.createInterface({ input, output });

async function recreateDatabase() {
  const answer = await rl.question(
    `This script will DROP and create the operational database ${env.DATABASE}, are you sure you want to continue? (yes/no) `,
  );
  if (answer.toLowerCase() === "yes") {
    console.log("Continuing...");

    console.log(
      await admin_db.execute(
        sql`DROP DATABASE IF EXISTS ${sql.raw(env.DATABASE)} with (force)`,
      ),
    );

    console.log(
      await admin_db.execute(sql`CREATE DATABASE ${sql.raw(env.DATABASE)}`),
    );
    const operational_db = drizzle(env.DATABASE_HOST + "/" + env.DATABASE);
    console.log(
      await operational_db.execute(
        sql`CREATE SCHEMA IF NOT EXISTS ${sql.raw(env.DATABASE_SCHEMA)}`,
      ),
    );
    console.log(
      await operational_db.execute(
        sql`CREATE SCHEMA IF NOT EXISTS ${sql.raw(env.GAME_DATABASE_SCHEMA)}`,
      ),
    );
  } else {
    console.log("Exiting...");
  }
  rl.close();
  process.exit(0);
}

recreateDatabase().catch((err) => {
  console.log(env.DATABASE_HOST);
  console.error("Error:", err);
  process.exit(1);
});
