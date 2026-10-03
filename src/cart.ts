export type TextSize = "regular" | "large" | "extra";

export type Entry = {
  id: string;
  name: string;
  emoji: string;
  done: boolean;
};

export type SavedCart = {
  textSize: TextSize;
  entries: Entry[];
};

export const EMPTY_CART: SavedCart = {
  textSize: "regular",
  entries: [],
};

export const PAGE_SIZE = 3;

export function parseCart(raw: string | null): SavedCart {
  if (!raw) return EMPTY_CART;
  try {
    const data = JSON.parse(raw) as Partial<SavedCart>;
    const textSize =
      data.textSize === "large" || data.textSize === "extra" ? data.textSize : "regular";
    const entries = Array.isArray(data.entries)
      ? data.entries.filter(
          (entry): entry is Entry =>
            !!entry &&
            typeof entry.id === "string" &&
            typeof entry.name === "string" &&
            typeof entry.emoji === "string" &&
            typeof entry.done === "boolean",
        )
      : [];
    return { textSize, entries };
  } catch {
    return EMPTY_CART;
  }
}

export function toggleCatalog(entries: Entry[], item: { id: string; name: string; emoji: string }): Entry[] {
  if (entries.some((entry) => entry.id === item.id)) {
    return entries.filter((entry) => entry.id !== item.id);
  }
  return [...entries, { id: item.id, name: item.name, emoji: item.emoji, done: false }];
}

export function addCustom(
  entries: Entry[],
  rawName: string,
): { entries: Entry[]; note: string } {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (!name) return { entries, note: "Type a name first." };
  const taken = entries.some((entry) => entry.name.toLowerCase() === name.toLowerCase());
  if (taken) return { entries, note: "Already on the list." };
  const entry: Entry = {
    id: `custom-${name.toLowerCase()}`,
    name,
    emoji: "🧺",
    done: false,
  };
  return { entries: [...entries, entry], note: "Added to the cart." };
}

export function markFound(entries: Entry[], id: string): Entry[] {
  return entries.map((entry) => (entry.id === id ? { ...entry, done: true } : entry));
}

export function markNeeded(entries: Entry[], id: string): Entry[] {
  return entries.map((entry) => (entry.id === id ? { ...entry, done: false } : entry));
}

export function clearFinished(entries: Entry[]): { entries: Entry[]; note: string } {
  if (!entries.some((entry) => entry.done)) {
    return { entries, note: "Nothing finished yet." };
  }
  return { entries: entries.filter((entry) => !entry.done), note: "Finished items cleared." };
}

export function undone(entries: Entry[]): Entry[] {
  return entries.filter((entry) => !entry.done);
}

export function pageCount(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

export function scaleFor(size: TextSize): number {
  if (size === "extra") return 1.28;
  if (size === "large") return 1.14;
  return 1;
}
