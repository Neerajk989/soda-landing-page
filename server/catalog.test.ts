import { describe, expect, it } from "vitest";
import { ANNOUNCEMENTS, COMMUNITY_EVENTS, CORE_MEMBERS, PROGRAM_TRACKS } from "./db";

describe("community content", () => {
  it("exposes distinct student-community events", () => {
    expect(COMMUNITY_EVENTS.map(event => event.slug)).toEqual([
      "student-builder-orientation",
      "cloud-foundations-study-circle",
    ]);
  });

  it("includes the learning tracks shown to students", () => {
    expect(PROGRAM_TRACKS).toContain("Serverless & APIs");
    expect(PROGRAM_TRACKS).toHaveLength(4);
  });

  it("provides student-facing announcements without inventing personal endorsements", () => {
    expect(ANNOUNCEMENTS.every(item => item.body.length > 20)).toBe(true);
    expect(ANNOUNCEMENTS.map(item => item.category)).toEqual(["program", "resource"]);
  });

  it("imports the complete supplied core roster with leadership positions", () => {
    expect(CORE_MEMBERS).toHaveLength(20);
    expect(CORE_MEMBERS[0]).toMatchObject({ fullName: "SARANG CHAKOLE", position: "Group Leader" });
    expect(CORE_MEMBERS.filter(member => member.position === "Head")).toHaveLength(5);
    expect(new Set(CORE_MEMBERS.map(member => member.team))).toEqual(new Set([
      "Community Leadership",
      "Technical Team",
      "Design & Content Team",
      "Operational Team",
      "Marketing & PR Team",
      "Event Team",
    ]));
  });
});
