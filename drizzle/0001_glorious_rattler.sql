CREATE TABLE `anomalies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anomalyType` enum('infrastructure_damage','environmental_hazard','civic_issue','data_discrepancy','emergency') NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`locationLatitude` decimal(10,8) NOT NULL,
	`locationLongitude` decimal(11,8) NOT NULL,
	`description` text NOT NULL,
	`nadeConfidenceScore` decimal(3,2),
	`status` enum('active','investigating','resolved','false_positive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `anomalies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` varchar(100) NOT NULL,
	`description` text,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `magic_moments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`missionId` int,
	`anomalyId` int,
	`photoUrl` varchar(512),
	`videoUrl` varchar(512),
	`description` text,
	`locationLatitude` decimal(10,8) NOT NULL,
	`locationLongitude` decimal(11,8) NOT NULL,
	`timestampCaptured` timestamp NOT NULL,
	`cryptographicSignature` varchar(512) NOT NULL,
	`verificationStatus` enum('pending','approved','rejected','disputed') NOT NULL DEFAULT 'pending',
	`truthScore` decimal(3,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `magic_moments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mission_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`missionId` int NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`status` enum('in_progress','completed','abandoned','expired') NOT NULL DEFAULT 'in_progress',
	CONSTRAINT `mission_acceptances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`missionType` enum('infrastructure','environmental','civic','social','emergency') NOT NULL,
	`difficulty` enum('easy','medium','hard','expert') NOT NULL DEFAULT 'medium',
	`locationLatitude` decimal(10,8) NOT NULL,
	`locationLongitude` decimal(11,8) NOT NULL,
	`locationRadiusMeters` int NOT NULL DEFAULT 100,
	`rewardTruthCredits` int NOT NULL,
	`rewardXp` int NOT NULL,
	`validationCriteria` text NOT NULL,
	`deadlineAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`status` enum('active','completed','expired','archived') NOT NULL DEFAULT 'active',
	CONSTRAINT `missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reality_stream_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`mediaUrls` json,
	`truthScore` decimal(3,2) NOT NULL DEFAULT '0',
	`upvotes` int NOT NULL DEFAULT 0,
	`downvotes` int NOT NULL DEFAULT 0,
	`verificationStatus` enum('unverified','verified','disputed') NOT NULL DEFAULT 'unverified',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reality_stream_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `truth_credit_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionType` enum('earn_mission','earn_verification','earn_upvote','redeem','transfer','admin_adjustment') NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(255),
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`cryptographicSignature` varchar(512) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `truth_credit_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`magicMomentId` int NOT NULL,
	`validatorId` int NOT NULL,
	`verdict` enum('approved','rejected','needs_review') NOT NULL,
	`reasoning` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `shadowCorpsTier` enum('recruit','analyst','sentinel','architect','witness') DEFAULT 'recruit' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `experiencePoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalTruthCredits` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `locationLatitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `users` ADD `locationLongitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `users` ADD `locationUpdatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `oathTaken` text DEFAULT ('false') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `oathTakenAt` timestamp;--> statement-breakpoint
CREATE INDEX `idx_priority_status` ON `anomalies` (`priority`,`status`);--> statement-breakpoint
CREATE INDEX `idx_anomaly_location` ON `anomalies` (`locationLatitude`,`locationLongitude`);--> statement-breakpoint
CREATE INDEX `idx_user_badge` ON `badges` (`userId`,`badgeType`);--> statement-breakpoint
CREATE INDEX `idx_user_created` ON `magic_moments` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_mm_location` ON `magic_moments` (`locationLatitude`,`locationLongitude`);--> statement-breakpoint
CREATE INDEX `idx_verification_status` ON `magic_moments` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `idx_user_mission` ON `mission_acceptances` (`userId`,`missionId`);--> statement-breakpoint
CREATE INDEX `idx_acceptance_status` ON `mission_acceptances` (`status`);--> statement-breakpoint
CREATE INDEX `idx_created_by` ON `missions` (`createdBy`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `missions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_location` ON `missions` (`locationLatitude`,`locationLongitude`);--> statement-breakpoint
CREATE INDEX `idx_post_id` ON `post_comments` (`postId`);--> statement-breakpoint
CREATE INDEX `idx_comment_user` ON `post_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_post_user_created` ON `reality_stream_posts` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_truth_score` ON `reality_stream_posts` (`truthScore`);--> statement-breakpoint
CREATE INDEX `idx_user_timestamp` ON `truth_credit_ledger` (`userId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_transaction_type` ON `truth_credit_ledger` (`transactionType`);--> statement-breakpoint
CREATE INDEX `idx_magic_moment` ON `verifications` (`magicMomentId`);--> statement-breakpoint
CREATE INDEX `idx_validator` ON `verifications` (`validatorId`);