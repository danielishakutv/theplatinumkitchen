// Aggregator. Each module exports its tables; this file re-exports them so
// drizzle-kit can see the whole schema in one place.
//
// Adding a new module: create src/modules/<m>/schema.ts and re-export it here.

export * from "@/modules/users/schema";
export * from "@/modules/auth/schema";
export * from "@/modules/profiles/schema";
export * from "@/modules/menu/schema";
export * from "@/modules/orders/schema";
export * from "@/modules/settings/schema";
export * from "@/modules/notifications/schema";
