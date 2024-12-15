import { api, HydrateClient } from "~/trpc/server";
import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { headers } from "next/headers";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import SuperJSON from "superjson";

import { MobGameInput } from "./mob-game-input";

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db: db, headers: new Headers(await headers()), session: null },
    transformer: SuperJSON,
  });
  // ctx: {db: db, headers: {}},
  // const id = context.params?.id as string;
  // prefetch `post.byId`
  await api.mob.list.prefetch();
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "astro3",
    label: "Astro3",
  },
];

export async function MobGame() {
  const mobs = await api.mob.list();
  return (
    <div>
      <h1>{mobs.map((mob) => mob.name).join(", ")}</h1>
      <MobGameInput frameworks={frameworks} />;
    </div>
  );
}
