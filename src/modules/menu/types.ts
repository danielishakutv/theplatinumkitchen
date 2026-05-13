export type MenuCategorySlug = string;

export interface MenuCategory {
  slug: MenuCategorySlug;
  name: string;
  tagline: string;
  sortOrder?: number;
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

export type MenuItemTag =
  | "spicy"
  | "chef's-pick"
  | "new"
  | "vegan"
  | "vegetarian"
  | "gluten-free";

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: MenuCategorySlug;
  tags?: MenuItemTag[];
  prepMinutes: number;
  available: boolean;
  // Customer notes field on the dish detail dialog. Optional in the type so
  // hand-authored data (e.g. seed) can omit them; the DB layer always
  // populates them via column defaults.
  notesEnabled?: boolean;
  notesPlaceholder?: string;
  addonGroups?: AddonGroup[];
}

export type MenuError =
  | "MENU_INVALID_INPUT"
  | "MENU_NOT_FOUND"
  | "MENU_SLUG_TAKEN"
  | "MENU_CATEGORY_NOT_FOUND"
  | "MENU_CATEGORY_SLUG_TAKEN"
  | "MENU_CATEGORY_HAS_ITEMS"
  | "MENU_ADDON_GROUP_NOT_FOUND"
  | "MENU_ADDON_GROUP_ID_TAKEN"
  | "MENU_ADDON_OPTION_NOT_FOUND"
  | "MENU_ADDON_OPTION_ID_TAKEN";

export class MenuServiceError extends Error {
  constructor(
    public readonly code: MenuError,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "MenuServiceError";
  }
}

export const MENU_ERROR_STATUS: Record<MenuError, number> = {
  MENU_INVALID_INPUT: 422,
  MENU_NOT_FOUND: 404,
  MENU_SLUG_TAKEN: 409,
  MENU_CATEGORY_NOT_FOUND: 422,
  MENU_CATEGORY_SLUG_TAKEN: 409,
  MENU_CATEGORY_HAS_ITEMS: 409,
  MENU_ADDON_GROUP_NOT_FOUND: 404,
  MENU_ADDON_GROUP_ID_TAKEN: 409,
  MENU_ADDON_OPTION_NOT_FOUND: 404,
  MENU_ADDON_OPTION_ID_TAKEN: 409,
};
