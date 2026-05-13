export type MenuCategorySlug =
  | "signatures"
  | "rice-and-grains"
  | "soups-and-swallow"
  | "grills-and-suya"
  | "small-chops"
  | "sides"
  | "drinks"
  | "desserts";

export interface MenuCategory {
  slug: MenuCategorySlug;
  name: string;
  tagline: string;
}

export type AddonGroupKind = "single" | "multiple";

export interface AddonOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface AddonGroup {
  id: string;
  label: string;
  kind: AddonGroupKind;
  required: boolean;
  min?: number;
  max?: number;
  options: AddonOption[];
}

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: MenuCategorySlug;
  tags?: ("spicy" | "chef's-pick" | "new" | "vegan" | "vegetarian" | "gluten-free")[];
  prepMinutes: number;
  available: boolean;
  addonGroups?: AddonGroup[];
}
