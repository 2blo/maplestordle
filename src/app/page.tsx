import { MobGame } from "~/components/mob-game";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b text-white dark:from-[hsl(0,0%,0%)] dark:to-[hsl(5,100%,5%)]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <MobGame></MobGame>
        </div>
      </main>
    </HydrateClient>
  );
}
