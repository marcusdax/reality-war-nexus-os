-- Shadow Corps Expansion Migration
-- Adds three new tables for the full Level 1-3 analyst infrastructure:
-- shadow_analyst_profiles, ghost_audits, shadow_black_book_entries

CREATE TABLE `shadow_analyst_profiles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `analystLevel` enum('1','2','3') NOT NULL DEFAULT '1',
  `aitrScore` decimal(5,2) DEFAULT '0',
  `repScore` decimal(5,2) DEFAULT '0',
  `zkpCredentialHash` varchar(512),
  `specializations` json,
  `missionsCompleted` int NOT NULL DEFAULT 0,
  `ghostAuditsInitiated` int NOT NULL DEFAULT 0,
  `soulsSaved` int NOT NULL DEFAULT 0,
  `cruciblePhase` enum('none','phase_1','phase_2','phase_3','complete') NOT NULL DEFAULT 'none',
  `crucibleStartedAt` timestamp NULL,
  `crucibleCompletedAt` timestamp NULL,
  `psychEvalCompleted` int NOT NULL DEFAULT 0,
  `technicalCertCompleted` int NOT NULL DEFAULT 0,
  `immutableOathHash` varchar(512),
  `oathRenewedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `shadow_analyst_profiles_pk` PRIMARY KEY(`id`),
  CONSTRAINT `shadow_analyst_profiles_userId_unique` UNIQUE(`userId`),
  INDEX `idx_analyst_user` (`userId`),
  INDEX `idx_analyst_level` (`analystLevel`)
);

CREATE TABLE `ghost_audits` (
  `id` int AUTO_INCREMENT NOT NULL,
  `initiatedBy` int NOT NULL,
  `auditTitle` varchar(255) NOT NULL,
  `targetEntity` text NOT NULL,
  `auditType` enum('financial_forensics','physical_surveillance','legal_analysis','behavioral_pattern','supply_chain') NOT NULL,
  `status` enum('initiated','active','synthesizing','complete','archived') NOT NULL DEFAULT 'initiated',
  `pteConfidenceScore` decimal(3,2),
  `findings` text,
  `evidenceUrls` json,
  `publishedToBlackBook` int NOT NULL DEFAULT 0,
  `analystLevel` enum('1','2','3') NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `completedAt` timestamp NULL,
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `ghost_audits_pk` PRIMARY KEY(`id`),
  INDEX `idx_audit_initiated_by` (`initiatedBy`),
  INDEX `idx_audit_status` (`status`),
  INDEX `idx_audit_type` (`auditType`)
);

CREATE TABLE `shadow_black_book_entries` (
  `id` int AUTO_INCREMENT NOT NULL,
  `auditId` int,
  `contributorId` int NOT NULL,
  `entryHash` varchar(512) NOT NULL,
  `previousHash` varchar(512),
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `evidenceUrls` json,
  `verificationLevel` enum('1','2','3') NOT NULL DEFAULT '1',
  `consensusVotes` int NOT NULL DEFAULT 0,
  `redactionStatus` enum('public','restricted','classified') NOT NULL DEFAULT 'public',
  `publishedAt` timestamp NOT NULL DEFAULT (now()),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `shadow_black_book_entries_pk` PRIMARY KEY(`id`),
  INDEX `idx_blackbook_contributor` (`contributorId`),
  INDEX `idx_blackbook_audit` (`auditId`),
  INDEX `idx_blackbook_level` (`verificationLevel`)
);
