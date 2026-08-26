import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { cartItems, InsertUser, products, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

export const PACK_SIZES = ["single", "six", "twelve"] as const;
export const CADENCES = ["one_time", "weekly", "monthly"] as const;
export type PackSize = (typeof PACK_SIZES)[number];
export type Cadence = (typeof CADENCES)[number];

export const CATALOG_PRODUCTS = [
  {
    slug: "diet-classic",
    name: "Diet Classic",
    description: "Crisp botanical refreshment with zero sugar and a clean emerald finish.",
    basePriceCents: 299,
    accent: "#0b8a78",
  },
  {
    slug: "zero-lime",
    name: "Zero Lime",
    description: "A bright, blue-lime twist with the same clean zero-sugar finish.",
    basePriceCents: 299,
    accent: "#0b4f8a",
  },
] as const;

export type CatalogProduct = (typeof CATALOG_PRODUCTS)[number];

export function calculatePriceCents(basePriceCents: number, packSize: PackSize, cadence: Cadence) {
  const packMultipliers: Record<PackSize, number> = { single: 1, six: 5.5, twelve: 10.2 };
  const cadenceDiscounts: Record<Cadence, number> = { one_time: 0, weekly: 0.05, monthly: 0.1 };
  return Math.round(basePriceCents * packMultipliers[packSize] * (1 - cadenceDiscounts[cadence]));
}

export function clampCartQuantity(quantity: number) {
  return Math.max(1, Math.min(24, Math.round(quantity)));
}

export function summarizeCartItems(items: Array<{ unitPriceCents: number; quantity: number }>) {
  return {
    subtotalCents: items.reduce((total, item) => total + item.unitPriceCents * clampCartQuantity(item.quantity), 0),
    totalItems: items.reduce((total, item) => total + clampCartQuantity(item.quantity), 0),
  };
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so type checks and unit tests can run without a database connection.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function seedCatalog() {
  const db = await getDb();
  if (!db) return;
  for (const product of CATALOG_PRODUCTS) {
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, product.slug)).limit(1);
    if (existing.length === 0) await db.insert(products).values({ ...product, active: 1 });
  }
}

export async function listProducts() {
  const db = await getDb();
  if (!db) return CATALOG_PRODUCTS.map(product => ({ ...product, id: 0, active: 1 }));
  await seedCatalog();
  return db.select().from(products).where(eq(products.active, 1));
}

export async function getCartSummary(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("The cart service is temporarily unavailable.");
  const items = await db
    .select({
      id: cartItems.id,
      productSlug: products.slug,
      productName: products.name,
      packSize: cartItems.packSize,
      cadence: cartItems.cadence,
      unitPriceCents: cartItems.unitPriceCents,
      quantity: cartItems.quantity,
      accent: products.accent,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  return { items, ...summarizeCartItems(items) };
}

export async function addCartItem(input: { userId: number; productSlug: string; packSize: PackSize; cadence: Cadence; quantity: number }) {
  const db = await getDb();
  if (!db) throw new Error("The cart service is temporarily unavailable.");
  await seedCatalog();
  const product = await db.select().from(products).where(and(eq(products.slug, input.productSlug), eq(products.active, 1))).limit(1);
  if (!product[0]) throw new Error("That flavor is not currently available.");

  const unitPriceCents = calculatePriceCents(product[0].basePriceCents, input.packSize, input.cadence);
  const existing = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(
      eq(cartItems.userId, input.userId),
      eq(cartItems.productId, product[0].id),
      eq(cartItems.packSize, input.packSize),
      eq(cartItems.cadence, input.cadence),
    ))
    .limit(1);

  if (existing[0]) {
    await db.update(cartItems).set({ quantity: clampCartQuantity(existing[0].quantity + input.quantity), unitPriceCents }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      userId: input.userId,
      productId: product[0].id,
      packSize: input.packSize,
      cadence: input.cadence,
      unitPriceCents,
      quantity: input.quantity,
    });
  }
  return getCartSummary(input.userId);
}

export async function updateCartItem(input: { userId: number; cartItemId: number; quantity: number }) {
  const db = await getDb();
  if (!db) throw new Error("The cart service is temporarily unavailable.");
  await db.update(cartItems).set({ quantity: input.quantity }).where(and(eq(cartItems.id, input.cartItemId), eq(cartItems.userId, input.userId)));
  return getCartSummary(input.userId);
}

export async function removeCartItem(input: { userId: number; cartItemId: number }) {
  const db = await getDb();
  if (!db) throw new Error("The cart service is temporarily unavailable.");
  await db.delete(cartItems).where(and(eq(cartItems.id, input.cartItemId), eq(cartItems.userId, input.userId)));
  return getCartSummary(input.userId);
}
