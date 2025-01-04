import Image from "next/image";
import { api } from "~/trpc/react";
import { Box } from "./ui/box";

export default function MobGuess(props: { id: number }) {
  const [guess] = api.mob.guessById.useSuspenseQuery({ id: props.id });
  return (
    <div className="">
      {guess ? (
        <div className="flex flex-row justify-end gap-4">
          <div className="flex flex-col justify-end">
            <Image
              src={`data:image/png;base64,${guess.mob.icon}`}
              width={guess.mob.width}
              height={guess.mob.height}
              alt="mob icon"
              style={{ imageRendering: "pixelated" }}
              className=""
            />
          </div>
          <div className="flex flex-row items-end gap-4">
            <Box
              variant={guess.grade.is_boss}
              text={guess.mob.is_boss ? "yes" : "no"}
            ></Box>
            <Box
              variant={guess.grade.mapMark}
              mapmarks={guess.mob.mapMarks}
            ></Box>
            <Box
              variant={guess.grade.color}
              text={Array.from(guess.mob.colors).join(", ")}
            ></Box>
            <Box
              variant={guess.grade.level}
              text={guess.mob.level.toString()}
            ></Box>
            <Box
              variant={guess.grade.width}
              text={guess.mob.width.toString()}
            ></Box>
            <Box
              variant={guess.grade.height}
              text={guess.mob.height.toString()}
            ></Box>
            <Box variant={guess.grade.name} text={guess.mob.name}></Box>
          </div>
        </div>
      ) : (
        <text>Mob not found</text>
      )}
    </div>
  );
}
