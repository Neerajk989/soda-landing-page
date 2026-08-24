import { z } from "zod";
import { addCartItem, CADENCES, getCartSummary, listProducts, PACK_SIZES, removeCartItem, updateCartItem } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const cartInput = z.object({
  productSlug: z.string().min(1).max(64),
  packSize: z.enum(PACK_SIZES),
  cadence: z.enum(CADENCES),
  quantity: z.number().int().min(1).max(24),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(() => listProducts()),
  }),
  cart: router({
    get: protectedProcedure.query(({ ctx }) => getCartSummary(ctx.user.id)),
    add: protectedProcedure.input(cartInput).mutation(({ ctx, input }) => addCartItem({ userId: ctx.user.id, ...input })),
    update: protectedProcedure.input(z.object({ cartItemId: z.number().int().positive(), quantity: z.number().int().min(1).max(24) })).mutation(({ ctx, input }) => updateCartItem({ userId: ctx.user.id, ...input })),
    remove: protectedProcedure.input(z.object({ cartItemId: z.number().int().positive() })).mutation(({ ctx, input }) => removeCartItem({ userId: ctx.user.id, ...input })),
  }),
});

export type AppRouter = typeof appRouter;
