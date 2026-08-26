import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth authentication. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Community events displayed publicly and open for authenticated student registrations. */
export const communityEvents = mysqlTable("communityEvents", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  scheduleLabel: varchar("scheduleLabel", { length: 128 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  format: mysqlEnum("format", ["in_person", "online", "hybrid"]).default("in_person").notNull(),
  audience: varchar("audience", { length: 96 }).notNull(),
  active: int("active").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Student registrations are private to each authenticated user. */
export const eventRegistrations = mysqlTable("eventRegistrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  uniqueRegistration: uniqueIndex("event_registration_user_event_unique").on(
    table.userId,
    table.eventId,
  ),
}));

/** A student’s submitted interest application for the on-campus builder program. */
export const builderApplications = mysqlTable("builderApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  branch: varchar("branch", { length: 96 }).notNull(),
  yearOfStudy: varchar("yearOfStudy", { length: 32 }).notNull(),
  linkedinUrl: varchar("linkedinUrl", { length: 256 }),
  skills: text("skills").notNull(),
  motivation: text("motivation").notNull(),
  status: mysqlEnum("status", ["submitted", "under_review", "selected"]).default("submitted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  uniqueApplicant: uniqueIndex("builder_application_user_unique").on(table.userId),
}));

/** Public notices are maintained by the community team. */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  category: mysqlEnum("category", ["program", "event", "resource"]).default("program").notNull(),
  active: int("active").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  uniqueTitle: uniqueIndex("announcements_title_unique").on(table.title),
}));

/** Public leadership and core-member roster for the student community. */
export const communityMembers = mysqlTable("communityMembers", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  position: varchar("position", { length: 96 }).notNull(),
  team: varchar("team", { length: 120 }).notNull(),
  branch: varchar("branch", { length: 128 }),
  yearOfStudy: varchar("yearOfStudy", { length: 32 }),
  usn: varchar("usn", { length: 64 }),
  linkedinUrl: varchar("linkedinUrl", { length: 256 }),
  contactNumber: varchar("contactNumber", { length: 32 }),
  showAcademicDetails: int("showAcademicDetails").notNull().default(0),
  showLinkedin: int("showLinkedin").notNull().default(0),
  showContactNumber: int("showContactNumber").notNull().default(0),
  sortOrder: int("sortOrder").notNull().default(100),
  active: int("active").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  uniqueMember: uniqueIndex("community_members_full_name_unique").on(table.fullName),
}));

/** Public enquiries remain available without requiring an account. */
export const contactEnquiries = mysqlTable("contactEnquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type BuilderApplication = typeof builderApplications.$inferSelect;
export type CommunityMember = typeof communityMembers.$inferSelect;
