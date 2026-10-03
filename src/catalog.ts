export type CatalogItem = {
  id: string;
  name: string;
  emoji: string;
};

export type Aisle = {
  id: string;
  title: string;
  items: CatalogItem[];
};

export const AISLES: Aisle[] = [
  {
    id: "produce",
    title: "Produce",
    items: [
      { id: "apples", name: "Apples", emoji: "🍎" },
      { id: "bananas", name: "Bananas", emoji: "🍌" },
      { id: "carrots", name: "Carrots", emoji: "🥕" },
      { id: "grapes", name: "Grapes", emoji: "🍇" },
    ],
  },
  {
    id: "cold",
    title: "Cold",
    items: [
      { id: "milk", name: "Milk", emoji: "🥛" },
      { id: "eggs", name: "Eggs", emoji: "🥚" },
      { id: "cheese", name: "Cheese", emoji: "🧀" },
      { id: "butter", name: "Butter", emoji: "🧈" },
    ],
  },
  {
    id: "pantry",
    title: "Pantry",
    items: [
      { id: "bread", name: "Bread", emoji: "🍞" },
      { id: "rice", name: "Rice", emoji: "🍚" },
      { id: "pasta", name: "Pasta", emoji: "🍝" },
      { id: "cereal", name: "Cereal", emoji: "🥣" },
    ],
  },
];

export const CATALOG: CatalogItem[] = AISLES.flatMap((aisle) => aisle.items);

export function itemById(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id);
}
