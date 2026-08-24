import { describe, expect, it } from "vitest";
import { calculatePriceCents, clampCartQuantity, CATALOG_PRODUCTS, summarizeCartItems } from "./db";

describe("Soda catalog pricing", () => {
  it("exposes the two active Soda flavors", () => {
    expect(CATALOG_PRODUCTS.map(product => product.slug)).toEqual(["diet-classic", "zero-lime"]);
  });

  it("applies pack and subscription pricing consistently", () => {
    expect(calculatePriceCents(299, "single", "one_time")).toBe(299);
    expect(calculatePriceCents(299, "six", "weekly")).toBe(1562);
    expect(calculatePriceCents(299, "twelve", "monthly")).toBe(2745);
  });

  it("bounds add and quantity-update inputs to the supported cart range", () => {
    expect(clampCartQuantity(0)).toBe(1);
    expect(clampCartQuantity(3.8)).toBe(4);
    expect(clampCartQuantity(28)).toBe(24);
  });

  it("calculates cart summaries after add, quantity update, and remove outcomes", () => {
    const afterAdd = summarizeCartItems([{ unitPriceCents: 1562, quantity: 1 }]);
    expect(afterAdd).toEqual({ subtotalCents: 1562, totalItems: 1 });

    const afterUpdate = summarizeCartItems([{ unitPriceCents: 1562, quantity: 2 }, { unitPriceCents: 299, quantity: 1 }]);
    expect(afterUpdate).toEqual({ subtotalCents: 3423, totalItems: 3 });

    const afterRemoval = summarizeCartItems([{ unitPriceCents: 299, quantity: 1 }]);
    expect(afterRemoval).toEqual({ subtotalCents: 299, totalItems: 1 });
  });
});
