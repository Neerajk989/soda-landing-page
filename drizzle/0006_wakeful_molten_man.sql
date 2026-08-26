CREATE TABLE `memberProfileClaims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberProfileClaims_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_profile_claim_member_unique` UNIQUE(`memberId`),
	CONSTRAINT `member_profile_claim_user_unique` UNIQUE(`userId`)
);
