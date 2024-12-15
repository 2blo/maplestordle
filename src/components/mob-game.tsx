import { api, HydrateClient } from "~/trpc/server";

import { MobGameInput } from "./mob-game-input";

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
