// Public surface of the menu module. Server-only — client components must
// import types only, or deep-import values from leaves like
// @/modules/menu/types, @/modules/menu/validation.
import "server-only";

export type {
  MenuCategory,
  MenuCategorySlug,
  MenuItem,
  AddonGroup,
  AddonOption,
  AddonGroupKind,
  MenuItemTag,
  MenuError,
} from "./types";
export {
  MenuServiceError,
  MENU_ERROR_STATUS,
  isItemAvailable,
} from "./types";
export {
  createItemSchema,
  updateItemSchema,
  createAddonGroupSchema,
  updateAddonGroupSchema,
  createAddonOptionSchema,
  updateAddonOptionSchema,
  createCategorySchema,
  updateCategorySchema,
  type CreateItemInput,
  type UpdateItemInput,
  type CreateAddonGroupInput,
  type UpdateAddonGroupInput,
  type CreateAddonOptionInput,
  type UpdateAddonOptionInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./validation";
export {
  listCategories,
  listItems,
  listLowStockItems,
  listAddonGroups,
  findItemBySlug,
  findItemById,
  findCategoryBySlug,
  countItemsByCategory,
  createItem,
  updateItem,
  deleteItem,
  toggleItemAvailable,
  createCategory,
  updateCategory,
  deleteCategory,
  createAddonGroup,
  updateAddonGroup,
  deleteAddonGroup,
  createAddonOption,
  updateAddonOption,
  deleteAddonOption,
} from "./service";
export {
  menuCategories,
  menuItems,
  menuAddonGroups,
  menuAddonOptions,
  menuItemAddons,
} from "./schema";
