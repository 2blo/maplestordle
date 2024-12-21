"use client";
import { Button } from "~/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import MobGuess from "~/components/mob-guess";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function MobGameInput(props: { mobs: { id: number; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mob, setMob] = useState<{ id: number; name: string } | undefined>();
  const [mobs, setMobs] = useState<number[]>([]);
  console.log(open);
  return (
    <div>
      <h1>Mob Game</h1>
      {mobs.map((mob) => (
        <MobGuess id={mob} key={mob} />
      ))}

      <text>{mob?.name}</text>
      <text> {mob?.id}</text>
      <Button
        variant={mob ? "default" : "ghost"}
        onClick={() => {
          if (mob) {
            setMobs((mobs) => [...mobs, mob.id]);
            setMob(undefined);
          }
        }}
      >
        Go!
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {mob?.name
              ? props.mobs.find((mobItem) => mobItem.name === mob?.name)?.name
              : "Select Mob..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search Mob..." />
            <CommandList>
              <CommandEmpty>No Mob found.</CommandEmpty>
              <CommandGroup>
                {props.mobs.map((mobItem) => (
                  <CommandItem
                    key={mobItem.id}
                    value={mobItem.name}
                    onSelect={(currentValue) => {
                      setMob(
                        currentValue === mob?.name
                          ? undefined
                          : { id: mobItem.id, name: currentValue },
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        mob?.name === mobItem.name
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {mobItem.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
