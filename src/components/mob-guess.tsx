"use client";
import Image from "next/image";
import { api } from "~/trpc/react";

export default function MobGuess(props: { id: number }) {
  const [mob] = api.mob.byId.useSuspenseQuery({ id: props.id });
  console.log(mob);

  return (
    <div className="">
      {mob ? (
        <div>
          <h2>
            name: {mob.name} level: {mob.level} width: {mob.width} height:{" "}
            {mob.height} is_boss: {mob.is_boss ? "true" : "false"} color1:{" "}
            {mob.color1} color2: {mob.color2}
          </h2>
          <Image
            src={`data:image/png;base64,${mob.icon}`}
            width={100}
            height={100}
            alt="mob icon"
          />
        </div>
      ) : (
        <text>Mob not found</text>
      )}
    </div>
  );
}
