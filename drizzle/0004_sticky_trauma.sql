ALTER TABLE `communityMembers` ADD `branch` varchar(128);--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `yearOfStudy` varchar(32);--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `usn` varchar(64);--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `linkedinUrl` varchar(256);--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `contactNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `showAcademicDetails` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `showLinkedin` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `communityMembers` ADD `showContactNumber` int DEFAULT 0 NOT NULL;