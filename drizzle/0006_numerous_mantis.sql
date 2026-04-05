CREATE TABLE `territories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`faction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL DEFAULT 'neutral',
	`centerLatitude` decimal(10,8) NOT NULL,
	`centerLongitude` decimal(11,8) NOT NULL,
	`radiusMeters` int NOT NULL DEFAULT 1000,
	`signalStrength` int NOT NULL DEFAULT 50,
	`memberCount` int NOT NULL DEFAULT 0,
	`controlledSince` timestamp NOT NULL DEFAULT (now()),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `territories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_faction` ON `territories` (`faction`);--> statement-breakpoint
CREATE INDEX `idx_territory_location` ON `territories` (`centerLatitude`,`centerLongitude`);--> statement-breakpoint
CREATE INDEX `idx_signal_strength` ON `territories` (`signalStrength`);