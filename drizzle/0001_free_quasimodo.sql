CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`category` enum('program','event','resource') NOT NULL DEFAULT 'program',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `builderApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`branch` varchar(96) NOT NULL,
	`yearOfStudy` varchar(32) NOT NULL,
	`linkedinUrl` varchar(256),
	`skills` text NOT NULL,
	`motivation` text NOT NULL,
	`status` enum('submitted','under_review','selected') NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `builderApplications_id` PRIMARY KEY(`id`),
	CONSTRAINT `builder_application_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `communityEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`scheduleLabel` varchar(128) NOT NULL,
	`location` varchar(160) NOT NULL,
	`format` enum('in_person','online','hybrid') NOT NULL DEFAULT 'in_person',
	`audience` varchar(96) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `communityEvents_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contactEnquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactEnquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventRegistrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventRegistrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_registration_user_event_unique` UNIQUE(`userId`,`eventId`)
);
--> statement-breakpoint
-- Legacy Soda tables are intentionally retained to avoid destructive data loss.
