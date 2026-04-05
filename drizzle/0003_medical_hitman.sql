CREATE TABLE `factions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(7) NOT NULL,
	`icon` varchar(255),
	`memberCount` int NOT NULL DEFAULT 0,
	`totalSignalStrength` int NOT NULL DEFAULT 0,
	`territoriesControlled` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `factions_id` PRIMARY KEY(`id`),
	CONSTRAINT `factions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `signal_strength_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`factionId` int NOT NULL,
	`transactionType` enum('mission_complete','verification','territory_capture','territory_defense','transfer','admin_adjustment') NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(255),
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_strength_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `territories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gridId` varchar(100) NOT NULL,
	`centerLatitude` decimal(10,8) NOT NULL,
	`centerLongitude` decimal(11,8) NOT NULL,
	`radiusMeters` int NOT NULL DEFAULT 500,
	`controllingFactionId` int,
	`signalStrengthEco` int NOT NULL DEFAULT 0,
	`signalStrengthData` int NOT NULL DEFAULT 0,
	`signalStrengthTech` int NOT NULL DEFAULT 0,
	`signalStrengthShadow` int NOT NULL DEFAULT 0,
	`capturePointsRequired` int NOT NULL DEFAULT 100,
	`lastCapturedAt` timestamp,
	`lastCapturedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `territories_id` PRIMARY KEY(`id`),
	CONSTRAINT `territories_gridId_unique` UNIQUE(`gridId`)
);
--> statement-breakpoint
CREATE TABLE `territory_capture_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`territoryId` int NOT NULL,
	`previousFactionId` int,
	`newFactionId` int NOT NULL,
	`capturedBy` int NOT NULL,
	`signalStrengthUsed` int NOT NULL,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `territory_capture_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_faction_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`factionId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`signalStrength` int NOT NULL DEFAULT 0,
	`factionRank` varchar(100) NOT NULL DEFAULT 'member',
	CONSTRAINT `user_faction_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_signal_user_faction` ON `signal_strength_ledger` (`userId`,`factionId`);--> statement-breakpoint
CREATE INDEX `idx_signal_transaction` ON `signal_strength_ledger` (`transactionType`);--> statement-breakpoint
CREATE INDEX `idx_grid_id` ON `territories` (`gridId`);--> statement-breakpoint
CREATE INDEX `idx_controlling_faction` ON `territories` (`controllingFactionId`);--> statement-breakpoint
CREATE INDEX `idx_territory_location` ON `territories` (`centerLatitude`,`centerLongitude`);--> statement-breakpoint
CREATE INDEX `idx_territory_capture` ON `territory_capture_history` (`territoryId`);--> statement-breakpoint
CREATE INDEX `idx_capture_faction` ON `territory_capture_history` (`newFactionId`);--> statement-breakpoint
CREATE INDEX `idx_user_faction` ON `user_faction_memberships` (`userId`,`factionId`);