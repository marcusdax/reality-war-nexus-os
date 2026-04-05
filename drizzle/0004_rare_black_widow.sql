CREATE TABLE `capture_contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`captureSessionId` int NOT NULL,
	`userId` int NOT NULL,
	`territoryId` int NOT NULL,
	`factionId` int NOT NULL,
	`pointsContributed` int NOT NULL,
	`contributionType` enum('passive','active','burst','defense') NOT NULL,
	`modifierApplied` decimal(3,2) NOT NULL DEFAULT 1,
	`contributedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `capture_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `capture_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`territoryId` int NOT NULL,
	`factionId` int NOT NULL,
	`capturePointsAccumulated` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`lastContributionAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','completed','abandoned','contested') NOT NULL DEFAULT 'active',
	CONSTRAINT `capture_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_contribution_session` ON `capture_contributions` (`captureSessionId`);--> statement-breakpoint
CREATE INDEX `idx_contribution_user` ON `capture_contributions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_contribution_territory` ON `capture_contributions` (`territoryId`);--> statement-breakpoint
CREATE INDEX `idx_capture_user_territory` ON `capture_sessions` (`userId`,`territoryId`);--> statement-breakpoint
CREATE INDEX `idx_capture_status` ON `capture_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_capture_territory` ON `capture_sessions` (`territoryId`);