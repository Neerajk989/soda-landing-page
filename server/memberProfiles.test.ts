import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { canSubmitMemberProfile } from "./db";
import { appRouter, memberProfileClaimInput, memberProfileSubmissionInput } from "./routers";

function memberContext(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 900,
      openId: "member-test-user",
      email: "member@example.com",
      name: "Member Test",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("member self-service profile controls", () => {
  it("requires an explicit acknowledgement before profile details may be submitted", () => {
    expect(() => memberProfileSubmissionInput.parse({
      memberId: 1,
      showAcademicDetails: false,
      showLinkedin: false,
      showContactNumber: false,
      acknowledgeOwnership: false,
    })).toThrow();
  });

  it("accepts a consent-aware submission payload only with acknowledgement", () => {
    expect(memberProfileSubmissionInput.parse({
      memberId: 1,
      branch: "Computer Science",
      yearOfStudy: "Third year",
      usn: "SBJ-001",
      showAcademicDetails: true,
      showLinkedin: false,
      showContactNumber: false,
      acknowledgeOwnership: true,
    })).toMatchObject({
      memberId: 1,
      showAcademicDetails: true,
      acknowledgeOwnership: true,
    });
  });

  it("requires an explicit identity acknowledgement before a member-profile claim can be requested", () => {
    expect(() => memberProfileClaimInput.parse({ memberId: 1, acknowledgeIdentity: false })).toThrow();
    expect(memberProfileClaimInput.parse({ memberId: 1, acknowledgeIdentity: true })).toEqual({ memberId: 1, acknowledgeIdentity: true });
  });

  it("permits profile details only for the verified owner or an administrator", () => {
    expect(canSubmitMemberProfile({ requestedMemberId: 3 })).toBe(false);
    expect(canSubmitMemberProfile({ claimedMemberId: 2, requestedMemberId: 3 })).toBe(false);
    expect(canSubmitMemberProfile({ claimedMemberId: 3, requestedMemberId: 3 })).toBe(true);
    expect(canSubmitMemberProfile({ requestedMemberId: 3, allowAdmin: true })).toBe(true);
  });

  it("prevents ordinary signed-in users from opening the approval queue", async () => {
    const caller = appRouter.createCaller(memberContext("user"));
    await expect(caller.community.pendingMemberProfileSubmissions()).rejects.toThrow("Administrator access is required.");
    await expect(caller.community.pendingMemberProfileClaims()).rejects.toThrow("Administrator access is required.");
  });
});
