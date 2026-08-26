import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createContactEnquiry, getStudentActivity, importMemberProfiles, listAnnouncements, listCommunityEvents, listCommunityMembers, registerForEvent, submitBuilderApplication } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const applicationInput = z.object({
  branch: z.string().trim().min(2).max(96),
  yearOfStudy: z.string().trim().min(1).max(32),
  linkedinUrl: z.string().url().max(256).optional().or(z.literal("")),
  skills: z.string().trim().min(8).max(1000),
  motivation: z.string().trim().min(40).max(3000),
});

const memberProfileInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  branch: z.string().trim().min(2).max(128).optional(),
  yearOfStudy: z.string().trim().min(1).max(32).optional(),
  usn: z.string().trim().min(2).max(64).optional(),
  linkedinUrl: z.string().url().max(256).optional().or(z.literal("")),
  contactNumber: z.string().trim().min(6).max(32).optional(),
  showAcademicDetails: z.boolean().default(false),
  showLinkedin: z.boolean().default(false),
  showContactNumber: z.boolean().default(false),
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  }
  return next();
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
  community: router({
    events: publicProcedure.query(() => listCommunityEvents()),
    announcements: publicProcedure.query(() => listAnnouncements()),
    members: publicProcedure.query(() => listCommunityMembers()),
    importMemberProfiles: adminProcedure
      .input(z.object({ profiles: z.array(memberProfileInput).min(1).max(100) }))
      .mutation(({ input }) => importMemberProfiles(input.profiles.map(profile => ({ ...profile, linkedinUrl: profile.linkedinUrl || undefined })))),
    contact: publicProcedure.input(z.object({
      name: z.string().trim().min(2).max(128),
      email: z.string().email().max(320),
      subject: z.string().trim().min(3).max(160),
      message: z.string().trim().min(20).max(4000),
    })).mutation(({ input }) => createContactEnquiry(input)),
  }),
  student: router({
    activity: protectedProcedure.query(({ ctx }) => getStudentActivity(ctx.user.id)),
    register: protectedProcedure.input(z.object({ eventSlug: z.string().min(1).max(96) })).mutation(({ ctx, input }) => registerForEvent({ userId: ctx.user.id, ...input })),
    submitApplication: protectedProcedure.input(applicationInput).mutation(({ ctx, input }) => submitBuilderApplication({ userId: ctx.user.id, ...input, linkedinUrl: input.linkedinUrl || undefined })),
  }),
});

export type AppRouter = typeof appRouter;
