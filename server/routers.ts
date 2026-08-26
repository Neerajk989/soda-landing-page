import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createContactEnquiry, getMyMemberProfileClaim, getStudentActivity, importMemberProfiles, listAnnouncements, listCommunityEvents, listCommunityMembers, listMemberProfileClaims, listMemberProfileSubmissions, registerForEvent, requestMemberProfileClaim, reviewMemberProfileClaim, reviewMemberProfileSubmission, submitBuilderApplication, submitMemberProfileDetails } from "./db";
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

export const memberProfileSubmissionInput = z.object({
  memberId: z.number().int().positive(),
  branch: z.string().trim().max(128).optional().or(z.literal("")),
  yearOfStudy: z.string().trim().max(32).optional().or(z.literal("")),
  usn: z.string().trim().max(64).optional().or(z.literal("")),
  linkedinUrl: z.string().url().max(256).optional().or(z.literal("")),
  contactNumber: z.string().trim().max(32).optional().or(z.literal("")),
  showAcademicDetails: z.boolean().default(false),
  showLinkedin: z.boolean().default(false),
  showContactNumber: z.boolean().default(false),
  acknowledgeOwnership: z.literal(true),
});

export const memberProfileClaimInput = z.object({
  memberId: z.number().int().positive(),
  acknowledgeIdentity: z.literal(true),
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
    myMemberProfileClaim: protectedProcedure.query(({ ctx }) => getMyMemberProfileClaim(ctx.user.id)),
    requestMemberProfileClaim: protectedProcedure
      .input(memberProfileClaimInput)
      .mutation(({ ctx, input }) => requestMemberProfileClaim({ memberId: input.memberId, userId: ctx.user.id })),
    submitMyMemberProfile: protectedProcedure
      .input(memberProfileSubmissionInput)
      .mutation(({ ctx, input }) => submitMemberProfileDetails({
        userId: ctx.user.id,
        memberId: input.memberId,
        branch: input.branch || undefined,
        yearOfStudy: input.yearOfStudy || undefined,
        usn: input.usn || undefined,
        linkedinUrl: input.linkedinUrl || undefined,
        contactNumber: input.contactNumber || undefined,
        showAcademicDetails: input.showAcademicDetails,
        showLinkedin: input.showLinkedin,
        showContactNumber: input.showContactNumber,
        allowAdmin: ctx.user.role === "admin",
      })),
    pendingMemberProfileClaims: adminProcedure.query(() => listMemberProfileClaims()),
    reviewMemberProfileClaim: adminProcedure
      .input(z.object({ claimId: z.number().int().positive(), approved: z.boolean() }))
      .mutation(({ ctx, input }) => reviewMemberProfileClaim({ claimId: input.claimId, reviewerUserId: ctx.user.id, approved: input.approved })),
    pendingMemberProfileSubmissions: adminProcedure.query(() => listMemberProfileSubmissions()),
    reviewMemberProfileSubmission: adminProcedure
      .input(z.object({ submissionId: z.number().int().positive(), approved: z.boolean() }))
      .mutation(({ ctx, input }) => reviewMemberProfileSubmission({ submissionId: input.submissionId, reviewerUserId: ctx.user.id, approved: input.approved })),
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
