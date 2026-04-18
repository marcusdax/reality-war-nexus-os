-- ============================================================================
-- Migration 0010: Battle Events, Squads, Duels
-- ============================================================================

-- Squads: Faction-aligned operative teams
CREATE TABLE `squads` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(60) NOT NULL,
  `tag` varchar(6) NOT NULL,
  `faction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL,
  `leaderId` int NOT NULL,
  `memberCount` int NOT NULL DEFAULT 1,
  `totalCapturePoints` int NOT NULL DEFAULT 0,
  `totalFlips` int NOT NULL DEFAULT 0,
  `wins` int NOT NULL DEFAULT 0,
  `losses` int NOT NULL DEFAULT 0,
  `bio` text,
  `emblem` varchar(4) DEFAULT '⚔',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `squads_id` PRIMARY KEY(`id`)
);

CREATE UNIQUE INDEX `idx_squad_tag` ON `squads` (`tag`);
CREATE INDEX `idx_squad_faction` ON `squads` (`faction`);
CREATE INDEX `idx_squad_leader` ON `squads` (`leaderId`);

-- Squad Members
CREATE TABLE `squad_members` (
  `id` int AUTO_INCREMENT NOT NULL,
  `squadId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('leader','officer','member') NOT NULL DEFAULT 'member',
  `capturePointsContributed` int NOT NULL DEFAULT 0,
  `flipsContributed` int NOT NULL DEFAULT 0,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `squad_members_id` PRIMARY KEY(`id`)
);

CREATE UNIQUE INDEX `idx_squad_member_unique` ON `squad_members` (`squadId`, `userId`);
CREATE INDEX `idx_squad_member_user` ON `squad_members` (`userId`);

-- Battle Events: Declared faction assaults on a territory with a time window
CREATE TABLE `battle_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `territoryId` int NOT NULL,
  `initiatedBy` int NOT NULL,
  `attackingFaction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL,
  `defendingFaction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL,
  `attackSquadId` int NULL,
  `defendSquadId` int NULL,
  `status` enum('pending','active','concluded','cancelled') NOT NULL DEFAULT 'pending',
  `durationMinutes` int NOT NULL DEFAULT 30,
  `attackPoints` int NOT NULL DEFAULT 0,
  `defendPoints` int NOT NULL DEFAULT 0,
  `attackerCount` int NOT NULL DEFAULT 0,
  `defenderCount` int NOT NULL DEFAULT 0,
  `winnerFaction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NULL,
  `tcPot` int NOT NULL DEFAULT 0,
  `startedAt` timestamp NULL,
  `endsAt` timestamp NULL,
  `concludedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `battle_events_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_battle_territory` ON `battle_events` (`territoryId`);
CREATE INDEX `idx_battle_status` ON `battle_events` (`status`);
CREATE INDEX `idx_battle_factions` ON `battle_events` (`attackingFaction`, `defendingFaction`);

-- Battle Participants: Who joined which battle and what they contributed
CREATE TABLE `battle_participants` (
  `id` int AUTO_INCREMENT NOT NULL,
  `battleId` int NOT NULL,
  `userId` int NOT NULL,
  `faction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL,
  `side` enum('attack','defend') NOT NULL,
  `pointsContributed` int NOT NULL DEFAULT 0,
  `actionsCount` int NOT NULL DEFAULT 0,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `battle_participants_id` PRIMARY KEY(`id`)
);

CREATE UNIQUE INDEX `idx_battle_participant_unique` ON `battle_participants` (`battleId`, `userId`);
CREATE INDEX `idx_battle_participant_battle` ON `battle_participants` (`battleId`);
CREATE INDEX `idx_battle_participant_user` ON `battle_participants` (`userId`);

-- Duels: 1v1 operative challenges with TC wager on territory control
CREATE TABLE `duels` (
  `id` int AUTO_INCREMENT NOT NULL,
  `challengerId` int NOT NULL,
  `challengerFaction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL,
  `defenderId` int NULL,
  `defenderFaction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NULL,
  `territoryId` int NOT NULL,
  `tcWager` int NOT NULL DEFAULT 100,
  `durationMinutes` int NOT NULL DEFAULT 60,
  `status` enum('open','accepted','active','concluded','cancelled','expired') NOT NULL DEFAULT 'open',
  `challengerPoints` int NOT NULL DEFAULT 0,
  `defenderPoints` int NOT NULL DEFAULT 0,
  `winnerId` int NULL,
  `acceptedAt` timestamp NULL,
  `startedAt` timestamp NULL,
  `endsAt` timestamp NULL,
  `concludedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `duels_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_duel_challenger` ON `duels` (`challengerId`);
CREATE INDEX `idx_duel_defender` ON `duels` (`defenderId`);
CREATE INDEX `idx_duel_territory` ON `duels` (`territoryId`);
CREATE INDEX `idx_duel_status` ON `duels` (`status`);

-- Add squadId reference to territory_capture_events for squad-attributed actions
ALTER TABLE `territory_capture_events`
  ADD COLUMN `squadId` int NULL AFTER `faction`,
  ADD COLUMN `battleId` int NULL AFTER `squadId`,
  ADD COLUMN `duelId` int NULL AFTER `battleId`;
