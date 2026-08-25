CREATE TABLE `communityMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`position` varchar(96) NOT NULL,
	`team` varchar(120) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 100,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_members_full_name_unique` UNIQUE(`fullName`)
);
