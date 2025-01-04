import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setEquals(
  xs: Set<string | undefined>,
  ys: Set<string | undefined>,
) {
  return xs.size === ys.size && [...xs].every((x) => ys.has(x));
}

export function setIntersection(
  xs: Set<string | undefined>,
  ys: Set<string | undefined>,
) {
  return new Set([...xs].filter((x) => ys.has(x)));
}
