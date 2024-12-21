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
  const [mobName, setMobName] = useState("");
  const [mobId, setMobId] = useState("");
  console.log(open);
  return (
    <div>
      <h1>Mob Game</h1>
      {false ? <text>a</text> : <text>b</text>}
      {/* <MobGuess mob={mob} /> */}
      <MobGuess id={9400765} />
      <text>{mobName}</text>
      <text> {mobId}</text>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {mobName
              ? props.mobs.find((mob) => mob.name === mobName)?.name
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
                {props.mobs.map((mob) => (
                  <CommandItem
                    key={mob.id}
                    value={mob.name}
                    onSelect={(currentValue) => {
                      setMobName(currentValue === mobName ? "" : currentValue);
                      setMobId(currentValue === mobName ? "" : mob.id.toString());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        mobName === mob.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {mob.name}
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
