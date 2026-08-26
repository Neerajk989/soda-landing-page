import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { announcements, builderApplications, communityEvents, communityMembers, contactEnquiries, eventRegistrations, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

export const COMMUNITY_EVENTS = [
  {
    slug: "student-builder-orientation",
    title: "Student Builder Orientation",
    description: "A welcome session for students who want to learn, build, and contribute to an AWS-focused campus community.",
    scheduleLabel: "Registration opening soon",
    location: "S.B. Jain campus",
    format: "in_person" as const,
    audience: "All students",
  },
  {
    slug: "cloud-foundations-study-circle",
    title: "Cloud Foundations Study Circle",
    description: "A peer-learning session built around core cloud concepts, practical study habits, and project readiness.",
    scheduleLabel: "Schedule to be announced",
    location: "Learning lab · S.B. Jain campus",
    format: "hybrid" as const,
    audience: "Beginners and builders",
  },
] as const;

export const ANNOUNCEMENTS = [
  { title: "Student Builder Program interest form", body: "Share your learning goals and project interests to receive program updates from the campus community team.", category: "program" as const },
  { title: "New to cloud learning?", body: "Explore the foundations track and join the community to meet peers building their first cloud projects.", category: "resource" as const },
] as const;

export const PROGRAM_TRACKS = ["Cloud foundations", "Serverless & APIs", "Data & AI", "Security & architecture"] as const;

/** Core roster imported from the AWS Student Builder Group workbook supplied by the community. */
export const CORE_MEMBERS = [
  { fullName: "SARANG CHAKOLE", position: "Group Leader", team: "Community Leadership", sortOrder: 1 },
  { fullName: "FAIZ SHAIKH", position: "Head", team: "Technical Team", sortOrder: 10 },
  { fullName: "NEERAJ KHAPRE", position: "Co-Head", team: "Technical Team", sortOrder: 11 },
  { fullName: "DEVANSHU KINDARLAEY", position: "Volunteer", team: "Technical Team", sortOrder: 12 },
  { fullName: "NEVIDITA NANDURKAR", position: "Volunteer", team: "Technical Team", sortOrder: 13 },
  { fullName: "TANUSHREE SAUNDARKAR", position: "Head", team: "Design & Content Team", sortOrder: 20 },
  { fullName: "SANKALP KADSE", position: "Design Co-Head", team: "Design & Content Team", sortOrder: 21 },
  { fullName: "ANSHUL MOTGHARE", position: "Content Co-Head", team: "Design & Content Team", sortOrder: 22 },
  { fullName: "PRANAV VISPUTE", position: "Head", team: "Operational Team", sortOrder: 30 },
  { fullName: "ISHA DHOK", position: "Co-Head", team: "Operational Team", sortOrder: 31 },
  { fullName: "NUTAN BHOYAR", position: "Volunteer", team: "Operational Team", sortOrder: 32 },
  { fullName: "KRUTIKA DHAVDE", position: "Volunteer", team: "Operational Team", sortOrder: 33 },
  { fullName: "JIYA SATHAWANE", position: "Head", team: "Marketing & PR Team", sortOrder: 40 },
  { fullName: "ANMOL CHAUBEY", position: "Co-Head", team: "Marketing & PR Team", sortOrder: 41 },
  { fullName: "VAISHNAVI SATHONE", position: "Volunteer", team: "Marketing & PR Team", sortOrder: 42 },
  { fullName: "GAURI SANGEWAR", position: "Volunteer", team: "Marketing & PR Team", sortOrder: 43 },
  { fullName: "AREEBA QURESHI", position: "Head", team: "Event Team", sortOrder: 50 },
  { fullName: "VANSH LUTE", position: "Co-Head", team: "Event Team", sortOrder: 51 },
  { fullName: "PUSHKAR MESHRAM", position: "Volunteer", team: "Event Team", sortOrder: 52 },
  { fullName: "SHAGUN HARINKHEDE", position: "Volunteer", team: "Event Team", sortOrder: 53 },
] as const;

export type MemberProfileImport = {
  fullName: string;
  branch?: string;
  yearOfStudy?: string;
  usn?: string;
  linkedinUrl?: string;
  contactNumber?: string;
  showAcademicDetails: boolean;
  showLinkedin: boolean;
  showContactNumber: boolean;
};

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

async function seedCommunityContent() {
  const db = await getDb();
  if (!db) return;
  for (const event of COMMUNITY_EVENTS) {
    const existing = await db.select({ id: communityEvents.id }).from(communityEvents).where(eq(communityEvents.slug, event.slug)).limit(1);
    if (existing.length === 0) await db.insert(communityEvents).values({ ...event, active: 1 });
  }
  for (const announcement of ANNOUNCEMENTS) {
    await db.insert(announcements).values({ ...announcement, active: 1 }).onDuplicateKeyUpdate({
      set: { body: announcement.body, category: announcement.category, active: 1 },
    });
  }
  for (const member of CORE_MEMBERS) {
    await db.insert(communityMembers).values({ ...member, active: 1 }).onDuplicateKeyUpdate({
      set: { position: member.position, team: member.team, sortOrder: member.sortOrder, active: 1 },
    });
  }
}

export async function listCommunityEvents() {
  const db = await getDb();
  if (!db) return COMMUNITY_EVENTS.map(event => ({ ...event, id: 0, active: 1 }));
  await seedCommunityContent();
  return db.select().from(communityEvents).where(eq(communityEvents.active, 1));
}

export async function listAnnouncements() {
  const db = await getDb();
  if (!db) return ANNOUNCEMENTS.map((announcement, index) => ({ ...announcement, id: -(index + 1), active: 1 }));
  await seedCommunityContent();
  return db.select().from(announcements).where(eq(announcements.active, 1)).orderBy(desc(announcements.createdAt));
}

export async function listCommunityMembers() {
  const db = await getDb();
  if (!db) return CORE_MEMBERS.map((member, index) => ({ ...member, id: -(index + 1), active: 1 }));
  await seedCommunityContent();
  const members = await db.select().from(communityMembers).where(eq(communityMembers.active, 1)).orderBy(communityMembers.sortOrder);
  return members.map(member => ({
    id: member.id,
    fullName: member.fullName,
    position: member.position,
    team: member.team,
    sortOrder: member.sortOrder,
    active: member.active,
    branch: member.showAcademicDetails ? member.branch : null,
    yearOfStudy: member.showAcademicDetails ? member.yearOfStudy : null,
    usn: member.showAcademicDetails ? member.usn : null,
    linkedinUrl: member.showLinkedin ? member.linkedinUrl : null,
    contactNumber: member.showContactNumber ? member.contactNumber : null,
    hasProfileDetails: Boolean(member.showAcademicDetails || member.showLinkedin || member.showContactNumber),
  }));
}

export async function importMemberProfiles(profiles: MemberProfileImport[]) {
  const db = await getDb();
  if (!db) throw new Error("The member-profile service is temporarily unavailable.");

  let updated = 0;
  for (const profile of profiles) {
    const existing = await db.select({ id: communityMembers.id }).from(communityMembers).where(eq(communityMembers.fullName, profile.fullName)).limit(1);
    if (!existing[0]) continue;
    await db.update(communityMembers).set({
      branch: profile.branch?.trim() || null,
      yearOfStudy: profile.yearOfStudy?.trim() || null,
      usn: profile.usn?.trim() || null,
      linkedinUrl: profile.linkedinUrl?.trim() || null,
      contactNumber: profile.contactNumber?.trim() || null,
      showAcademicDetails: profile.showAcademicDetails ? 1 : 0,
      showLinkedin: profile.showLinkedin ? 1 : 0,
      showContactNumber: profile.showContactNumber ? 1 : 0,
    }).where(eq(communityMembers.id, existing[0].id));
    updated += 1;
  }
  return { updated } as const;
}

export async function getStudentActivity(userId: number) {
  const db = await getDb();
  if (!db) return { registrations: [], application: undefined };
  const registrations = await db
    .select({ id: eventRegistrations.id, title: communityEvents.title, scheduleLabel: communityEvents.scheduleLabel, location: communityEvents.location })
    .from(eventRegistrations)
    .innerJoin(communityEvents, eq(eventRegistrations.eventId, communityEvents.id))
    .where(eq(eventRegistrations.userId, userId));
  const application = await db.select().from(builderApplications).where(eq(builderApplications.userId, userId)).limit(1);
  return { registrations, application: application[0] };
}

export async function registerForEvent(input: { userId: number; eventSlug: string }) {
  const db = await getDb();
  if (!db) throw new Error("The event registration service is temporarily unavailable.");
  await seedCommunityContent();
  const event = await db.select().from(communityEvents).where(and(eq(communityEvents.slug, input.eventSlug), eq(communityEvents.active, 1))).limit(1);
  if (!event[0]) throw new Error("This event is no longer available for registration.");
  const existing = await db.select({ id: eventRegistrations.id }).from(eventRegistrations).where(and(eq(eventRegistrations.userId, input.userId), eq(eventRegistrations.eventId, event[0].id))).limit(1);
  if (existing[0]) return { alreadyRegistered: true };
  await db.insert(eventRegistrations).values({ userId: input.userId, eventId: event[0].id });
  return { alreadyRegistered: false };
}

export async function submitBuilderApplication(input: { userId: number; branch: string; yearOfStudy: string; linkedinUrl?: string; skills: string; motivation: string }) {
  const db = await getDb();
  if (!db) throw new Error("The application service is temporarily unavailable.");
  const existing = await db.select({ id: builderApplications.id }).from(builderApplications).where(eq(builderApplications.userId, input.userId)).limit(1);
  if (existing[0]) {
    await db.update(builderApplications).set({ ...input, linkedinUrl: input.linkedinUrl || null, status: "submitted" }).where(eq(builderApplications.id, existing[0].id));
  } else {
    await db.insert(builderApplications).values({ ...input, linkedinUrl: input.linkedinUrl || null });
  }
  return { success: true } as const;
}

export async function createContactEnquiry(input: { name: string; email: string; subject: string; message: string }) {
  const db = await getDb();
  if (!db) throw new Error("The enquiry service is temporarily unavailable.");
  await db.insert(contactEnquiries).values(input);
  return { success: true } as const;
}
