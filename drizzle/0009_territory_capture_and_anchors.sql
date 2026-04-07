-- ============================================================================
-- Migration 0009: Territory Capture System, Signal Decay, Reality Anchors
-- ============================================================================

-- Add decay tracking and pending faction to territories
ALTER TABLE `territories`
  ADD COLUMN `decayRate` int NOT NULL DEFAULT 5 AFTER `signalStrength`,
  ADD COLUMN `lastSignalUpdate` timestamp NULL AFTER `decayRate`,
  ADD COLUMN `pendingFaction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NULL AFTER `lastSignalUpdate`;

-- Territory capture events: each user action that shifts signal strength
CREATE TABLE `territory_capture_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `territoryId` int NOT NULL,
  `userId` int NOT NULL,
  `faction` enum('truth_seekers','reality_architects','shadow_corps','neutral') NOT NULL,
  `capturePoints` int NOT NULL DEFAULT 10,
  `signalBefore` int NOT NULL,
  `signalAfter` int NOT NULL,
  `eventType` enum('reinforce','contest','flip','decay') NOT NULL DEFAULT 'reinforce',
  `capturedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `territory_capture_events_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_capture_territory` ON `territory_capture_events` (`territoryId`);
CREATE INDEX `idx_capture_user` ON `territory_capture_events` (`userId`);
CREATE INDEX `idx_capture_faction` ON `territory_capture_events` (`faction`);
CREATE INDEX `idx_capture_time` ON `territory_capture_events` (`capturedAt`);

-- Reality Anchors: investigator-placed anomaly detection markers
CREATE TABLE `reality_anchors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `placedBy` int NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `anchorType` enum('identity_challenge','signal_anomaly','data_inconsistency','reality_fracture','convergence_rift') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `evidenceUrl` varchar(1024),
  `confidenceScore` decimal(3,2) NOT NULL DEFAULT 0.50,
  `status` enum('active','investigating','confirmed','debunked','expired') NOT NULL DEFAULT 'active',
  `investigatorCount` int NOT NULL DEFAULT 0,
  `rewardTruthCredits` int NOT NULL DEFAULT 200,
  `rewardXp` int NOT NULL DEFAULT 100,
  `expiresAt` timestamp NULL,
  `resolvedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `reality_anchors_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_anchor_location` ON `reality_anchors` (`latitude`, `longitude`);
CREATE INDEX `idx_anchor_status` ON `reality_anchors` (`status`);
CREATE INDEX `idx_anchor_placed_by` ON `reality_anchors` (`placedBy`);

-- Reality Anchor Investigations: users investigating an anchor
CREATE TABLE `anchor_investigations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `anchorId` int NOT NULL,
  `userId` int NOT NULL,
  `verdict` enum('confirmed','debunked','inconclusive') NULL,
  `notes` text,
  `evidenceUrl` varchar(1024),
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verdictAt` timestamp NULL,
  CONSTRAINT `anchor_investigations_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_investigation_anchor` ON `anchor_investigations` (`anchorId`);
CREATE INDEX `idx_investigation_user` ON `anchor_investigations` (`userId`);
