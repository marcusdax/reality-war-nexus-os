# The Reality War: Nexus OS - Technical Architecture

**Author:** Manus AI  
**Date:** March 16, 2026  
**Version:** 1.0  
**Status:** Design Phase

---

## Executive Summary

The Reality War is a civic engagement and reality verification platform that gamifies community participation through location-based missions and a blockchain-inspired rewards system. The platform addresses the "Reality Crisis"—the catastrophic disconnect between digital representations and physical ground truth—by recruiting a distributed network of "Shadow Corps" members to document, verify, and validate real-world information.

The architecture is built on a **full-stack Node.js/React foundation** with **tRPC for type-safe APIs**, **MySQL/TiDB for persistent storage**, **Google Maps for spatial computing**, and **LLM integration for intelligent mission generation**. The design emphasizes **transparency, immutability, and user sovereignty** through cryptographic verification and blockchain-inspired ledger systems.

---

## 1. Core Concepts & Domain Model

### 1.1 The Reality Crisis

The Reality Crisis is defined by:
- **Data Latency:** Municipal infrastructure data averages 8 months old
- **Accuracy Gap:** 40% accuracy ceiling for municipal infrastructure in most US cities
- **Economic Waste:** $205 billion annually wasted due to inaccurate digital representations
- **Decision Failures:** Critical decisions made on hallucinated data, leading to preventable disasters and unprosecuted crimes

### 1.2 Domain Entities

| Entity | Purpose | Key Attributes |
|--------|---------|-----------------|
| **User** | Shadow Corps member with verified identity | openId, name, email, role, tier, experience, location |
| **Mission** | Verification task with specific objectives | title, description, location, type, difficulty, reward, deadline, validation_criteria |
| **Magic Moment** | 15-second verified documentation of reality | user_id, mission_id, photo_url, video_url, timestamp, geolocation, cryptographic_signature, truth_score |
| **Truth Credit** | Blockchain-inspired reward token | user_id, amount, reason, transaction_type, ledger_entry_id |
| **Anomaly** | Detected deviation from expected reality state | location, type, priority, description, nade_confidence_score, assigned_missions |
| **Verification** | Community validation of a Magic Moment | magic_moment_id, validator_id, verdict (approved/rejected), reasoning, timestamp |
| **Reality Stream Post** | Social feed entry with community-verified content | user_id, content, media_urls, truth_score, upvotes, comments, timestamp |
| **Badge** | Achievement recognition for milestones | user_id, badge_type, earned_at, description |
| **Ledger Entry** | Immutable record of Truth Credit transaction | user_id, transaction_type, amount, timestamp, signature, metadata |

### 1.3 Gamification Mechanics

**Experience & Progression:**
- Users earn XP for completing missions, verifications, and community engagement
- Progression unlocks new mission types, higher rewards, and Shadow Corps tiers
- Tiers: Recruit → Analyst → Sentinel → Architect → Witness

**Truth Credits Economy:**
- Earned through: mission completion (5-50 credits), peer verification (1-10 credits), community upvotes (0.5-2 credits)
- Redeemable at: local businesses, civic organizations, educational resources
- Transferable: users can gift credits to community members or organizations

**Leaderboards & Recognition:**
- Global leaderboard: ranked by total Truth Credits earned
- Local leaderboard: ranked by contributions in geographic area
- Seasonal leaderboard: reset quarterly with special rewards
- Badges: achievement system for milestones (first mission, 100 verifications, etc.)

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Tailwind CSS 4 + TypeScript | Interactive UI with responsive design |
| **API Layer** | tRPC 11 + Express 4 | Type-safe RPC procedures with automatic client generation |
| **Backend** | Node.js + Express | Server-side business logic and data processing |
| **Database** | MySQL 8 / TiDB | Persistent storage with ACID compliance |
| **ORM** | Drizzle ORM | Type-safe database queries with migrations |
| **Maps** | Google Maps API (via Manus proxy) | Spatial computing and geolocation services |
| **Auth** | Manus OAuth 2.0 | Decentralized identity and session management |
| **LLM** | Manus Built-in LLM API | Mission generation, content analysis, anomaly detection |
| **Storage** | AWS S3 (via Manus proxy) | Photo/video storage and immutable ledger records |
| **Notifications** | Manus Built-in Notification API | Push notifications and real-time alerts |
| **Testing** | Vitest + React Testing Library | Unit and integration tests |

### 2.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Map Interface│  │ Mission Feed │  │ Reality      │           │
│  │ (Google Maps)│  │ (Anomalies)  │  │ Stream       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Profile      │  │ Admin Panel  │  │ Onboarding  │           │
│  │ Dashboard    │  │ (Moderation) │  │ Tutorials   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└────────────────────────────┬──────────────────────────────────────┘
                             │ tRPC + WebSocket
┌────────────────────────────▼──────────────────────────────────────┐
│                    API Layer (tRPC Router)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Mission      │  │ Verification │  │ Truth Credits│            │
│  │ Procedures   │  │ Procedures   │  │ Procedures   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Anomaly      │  │ Reality      │  │ Admin        │            │
│  │ Procedures   │  │ Stream Procs │  │ Procedures   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────────────────────────┬──────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    Service Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Mission      │  │ Verification │  │ NADE Anomaly │            │
│  │ Service      │  │ Service      │  │ Detection    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Truth Credit │  │ LLM Mission  │  │ Notification │            │
│  │ Ledger       │  │ Generator    │  │ Service      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────────────────────────┬──────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    Data Layer                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ MySQL/TiDB   │  │ Google Maps  │  │ AWS S3       │            │
│  │ (Persistent) │  │ (Geospatial) │  │ (Storage)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │ Manus Auth   │  │ Manus LLM    │                              │
│  │ (OAuth)      │  │ (Intelligence)                              │
│  └──────────────┘  └──────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Core Tables

**users**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  role ENUM('user', 'admin') DEFAULT 'user',
  shadow_corps_tier ENUM('recruit', 'analyst', 'sentinel', 'architect', 'witness') DEFAULT 'recruit',
  experience_points INT DEFAULT 0,
  total_truth_credits INT DEFAULT 0,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_updated_at TIMESTAMP,
  oath_taken BOOLEAN DEFAULT FALSE,
  oath_taken_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**missions**
```sql
CREATE TABLE missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  mission_type ENUM('infrastructure', 'environmental', 'civic', 'social', 'emergency') NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  location_radius_meters INT DEFAULT 100,
  reward_truth_credits INT NOT NULL,
  reward_xp INT NOT NULL,
  validation_criteria TEXT NOT NULL,
  deadline_at TIMESTAMP,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'completed', 'expired', 'archived') DEFAULT 'active',
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**magic_moments**
```sql
CREATE TABLE magic_moments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mission_id INT,
  anomaly_id INT,
  photo_url VARCHAR(512),
  video_url VARCHAR(512),
  description TEXT,
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  timestamp_captured TIMESTAMP NOT NULL,
  cryptographic_signature VARCHAR(512) NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected', 'disputed') DEFAULT 'pending',
  truth_score DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  FOREIGN KEY (anomaly_id) REFERENCES anomalies(id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_location (location_latitude, location_longitude)
);
```

**truth_credit_ledger**
```sql
CREATE TABLE truth_credit_ledger (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  transaction_type ENUM('earn_mission', 'earn_verification', 'earn_upvote', 'redeem', 'transfer', 'admin_adjustment') NOT NULL,
  amount INT NOT NULL,
  reason VARCHAR(255),
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  cryptographic_signature VARCHAR(512) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_timestamp (user_id, timestamp),
  INDEX idx_transaction_type (transaction_type)
);
```

**anomalies**
```sql
CREATE TABLE anomalies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  anomaly_type ENUM('infrastructure_damage', 'environmental_hazard', 'civic_issue', 'data_discrepancy', 'emergency') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  description TEXT NOT NULL,
  nade_confidence_score DECIMAL(3, 2),
  status ENUM('active', 'investigating', 'resolved', 'false_positive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  INDEX idx_priority_status (priority, status),
  INDEX idx_location (location_latitude, location_longitude)
);
```

**verifications**
```sql
CREATE TABLE verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  magic_moment_id INT NOT NULL,
  validator_id INT NOT NULL,
  verdict ENUM('approved', 'rejected', 'needs_review') NOT NULL,
  reasoning TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (magic_moment_id) REFERENCES magic_moments(id),
  FOREIGN KEY (validator_id) REFERENCES users(id),
  INDEX idx_magic_moment (magic_moment_id),
  INDEX idx_validator (validator_id)
);
```

**reality_stream_posts**
```sql
CREATE TABLE reality_stream_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  media_urls JSON,
  truth_score DECIMAL(3, 2) DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  verification_status ENUM('unverified', 'verified', 'disputed') DEFAULT 'unverified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_truth_score (truth_score)
);
```

**badges**
```sql
CREATE TABLE badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_type VARCHAR(100) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_badge (user_id, badge_type)
);
```

---

## 4. API Procedures (tRPC Routers)

### 4.1 Mission Router

```typescript
missions: {
  // List missions near user location with filtering
  listNearby: protectedProcedure
    .input(z.object({ 
      latitude: z.number(), 
      longitude: z.number(), 
      radius_km: z.number().default(5),
      difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
      type: z.enum(['infrastructure', 'environmental', 'civic', 'social', 'emergency']).optional()
    }))
    .query(async ({ input, ctx }) => {
      // Query missions within radius, sorted by distance
      // Apply filters and return with distance calculations
    }),

  // Get mission details
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return mission with validation criteria and user progress
    }),

  // Accept mission (user starts mission)
  accept: protectedProcedure
    .input(z.object({ mission_id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Create mission_acceptance record, track start time
    }),

  // Submit Magic Moment for mission
  submitMagicMoment: protectedProcedure
    .input(z.object({
      mission_id: z.number(),
      photo_url: z.string().optional(),
      video_url: z.string().optional(),
      description: z.string(),
      latitude: z.number(),
      longitude: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create magic_moment record with cryptographic signature
      // Trigger verification process
      // Award initial Truth Credits
    }),

  // Create new mission (admin only)
  create: adminProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      mission_type: z.enum(['infrastructure', 'environmental', 'civic', 'social', 'emergency']),
      difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
      latitude: z.number(),
      longitude: z.number(),
      reward_truth_credits: z.number(),
      validation_criteria: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create mission record
    })
}
```

### 4.2 Verification Router

```typescript
verification: {
  // Get pending verifications for user
  getPending: protectedProcedure
    .query(async ({ ctx }) => {
      // Return magic_moments awaiting verification
    }),

  // Submit verification verdict
  submit: protectedProcedure
    .input(z.object({
      magic_moment_id: z.number(),
      verdict: z.enum(['approved', 'rejected', 'needs_review']),
      reasoning: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create verification record
      // Update magic_moment verification_status
      // Award Truth Credits to validator if approved
      // Notify original user
    }),

  // Get verification history for magic moment
  getHistory: protectedProcedure
    .input(z.object({ magic_moment_id: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return all verifications for a magic moment
    })
}
```

### 4.3 Truth Credits Router

```typescript
truthCredits: {
  // Get user's Truth Credit balance
  getBalance: protectedProcedure
    .query(async ({ ctx }) => {
      // Return current balance and recent transactions
    }),

  // Get ledger history
  getLedger: protectedProcedure
    .input(z.object({ 
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input, ctx }) => {
      // Return paginated ledger entries
    }),

  // Transfer Truth Credits to another user
  transfer: protectedProcedure
    .input(z.object({
      recipient_id: z.number(),
      amount: z.number().min(1),
      reason: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create two ledger entries (debit and credit)
      // Verify sufficient balance
      // Notify recipient
    }),

  // Redeem Truth Credits at business
  redeem: protectedProcedure
    .input(z.object({
      business_id: z.number(),
      amount: z.number().min(1),
      reward_id: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create redemption ledger entry
      // Generate redemption code
      // Notify business
    })
}
```

### 4.4 Anomaly Router

```typescript
anomaly: {
  // Get anomalies near user location
  getNearby: protectedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius_km: z.number().default(5),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
    }))
    .query(async ({ input, ctx }) => {
      // Return anomalies sorted by priority and distance
    }),

  // Get anomaly details
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return anomaly with related missions and verifications
    }),

  // Report new anomaly (user-generated)
  report: protectedProcedure
    .input(z.object({
      anomaly_type: z.enum(['infrastructure_damage', 'environmental_hazard', 'civic_issue', 'data_discrepancy', 'emergency']),
      description: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      photo_url: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create anomaly record
      // Trigger NADE analysis
      // Generate verification missions
    })
}
```

### 4.5 Reality Stream Router

```typescript
realityStream: {
  // Get feed of verified posts
  getFeed: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      sort: z.enum(['recent', 'trending', 'verified']).default('recent')
    }))
    .query(async ({ input, ctx }) => {
      // Return paginated posts with verification status
    }),

  // Create post
  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      media_urls: z.array(z.string()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create reality_stream_post record
    }),

  // Upvote post
  upvote: protectedProcedure
    .input(z.object({ post_id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Create upvote record
      // Update truth_score
      // Award Truth Credits to author
    }),

  // Comment on post
  comment: protectedProcedure
    .input(z.object({
      post_id: z.number(),
      content: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create comment record
      // Notify post author
    })
}
```

### 4.6 User Profile Router

```typescript
profile: {
  // Get user profile
  getProfile: protectedProcedure
    .input(z.object({ user_id: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      // Return user profile with stats and badges
    }),

  // Update profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      location_latitude: z.number().optional(),
      location_longitude: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Update user record
    }),

  // Take Shadow Corps oath
  takeOath: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Update oath_taken flag
      // Award initial Truth Credits
      // Send welcome notification
    }),

  // Get leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      type: z.enum(['global', 'local', 'seasonal']).default('global'),
      limit: z.number().default(100)
    }))
    .query(async ({ input, ctx }) => {
      // Return ranked users with stats
    })
}
```

### 4.7 Admin Router

```typescript
admin: {
  // Get moderation queue
  getModerationQueue: adminProcedure
    .query(async ({ ctx }) => {
      // Return disputed magic_moments and flagged posts
    }),

  // Resolve moderation case
  resolveModerationCase: adminProcedure
    .input(z.object({
      case_type: z.enum(['magic_moment', 'post', 'user']),
      case_id: z.number(),
      resolution: z.enum(['approved', 'rejected', 'user_warning', 'user_suspension']),
      reasoning: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Update case status
      // Award/deduct Truth Credits as needed
      // Notify involved parties
    }),

  // Generate LLM missions
  generateMissions: adminProcedure
    .input(z.object({
      location_latitude: z.number(),
      location_longitude: z.number(),
      count: z.number().default(5),
      focus_area: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Call LLM to generate missions
      // Create mission records
    }),

  // Get analytics
  getAnalytics: adminProcedure
    .query(async ({ ctx }) => {
      // Return platform-wide metrics and trends
    })
}
```

---

## 5. Service Layer

### 5.1 Mission Service

Handles mission lifecycle: creation, acceptance, completion, and reward distribution.

**Key Methods:**
- `createMission()` - Generate mission from LLM or manual input
- `acceptMission()` - User starts mission, records timestamp
- `submitMagicMoment()` - Process verification submission
- `completeMission()` - Award Truth Credits and XP
- `expireMission()` - Handle expired missions

### 5.2 Verification Service

Manages the peer-review and validation process for Magic Moments.

**Key Methods:**
- `getPendingVerifications()` - Return missions needing review
- `submitVerification()` - Process validator's verdict
- `calculateTruthScore()` - Aggregate verification results
- `awardVerificationCredits()` - Compensate validators
- `flagDisputedContent()` - Escalate to admin

### 5.3 Truth Credit Ledger Service

Maintains immutable record of all Truth Credit transactions.

**Key Methods:**
- `recordTransaction()` - Create cryptographically signed ledger entry
- `getBalance()` - Calculate current balance from ledger
- `transfer()` - Execute peer-to-peer transfers
- `redeem()` - Process business redemptions
- `validateSignature()` - Verify ledger entry authenticity

### 5.4 NADE Anomaly Detection Service

Simulates the Neuromorphic Anomaly Detection Engine for intelligent anomaly flagging.

**Key Methods:**
- `analyzeLocation()` - Detect anomalies in geographic area
- `prioritizeAnomalies()` - Rank by severity and relevance
- `generateMissionsForAnomalies()` - Create verification tasks
- `updateConfidenceScore()` - Refine anomaly assessment based on verifications

### 5.5 LLM Mission Generator Service

Uses LLM to intelligently generate contextual verification missions.

**Key Methods:**
- `generateMissions()` - Create missions based on location and community needs
- `generateValidationCriteria()` - Define success metrics for missions
- `analyzeAnomalies()` - Interpret anomaly data and suggest verification approaches
- `generateOnboardingContent()` - Create educational tutorials

### 5.6 Notification Service

Manages push notifications and real-time alerts.

**Key Methods:**
- `notifyNearbyAnomalies()` - Alert users to high-priority tasks
- `notifyVerificationApproved()` - Confirm validation success
- `notifyBadgeEarned()` - Celebrate achievements
- `notifyTruthCreditsEarned()` - Reward notifications

---

## 6. Frontend Architecture

### 6.1 Page Structure

| Page | Purpose | Key Components |
|------|---------|-----------------|
| **Home/Dashboard** | Landing and user overview | Mission feed, Truth Credit balance, progress |
| **Map Interface** | Interactive mission discovery | Google Maps, mission markers, anomaly indicators |
| **Mission Detail** | Mission information and submission | Mission description, validation criteria, photo/video capture |
| **Magic Moment Capture** | 15-second verification recording | Camera interface, geolocation, timestamp display |
| **Verification Queue** | Peer review interface | Magic Moment cards, verdict submission, reasoning |
| **Reality Stream** | Social feed of verified content | Posts, upvotes, comments, truth scores |
| **Profile** | User statistics and progression | XP, badges, Truth Credit history, leaderboard rank |
| **Shadow Corps Recruitment** | Onboarding and oath system | Manifesto, oath ceremony, initial missions |
| **Admin Dashboard** | Moderation and analytics | Moderation queue, mission creation, analytics |
| **Onboarding Tutorials** | Educational flow | Reality Crisis explanation, verification methodology |

### 6.2 Component Hierarchy

```
App
├── Navigation (persistent header/sidebar)
├── ThemeProvider (sacred geometry color scheme)
├── Router
│   ├── Home
│   ├── MapInterface
│   │   ├── GoogleMap
│   │   ├── MissionMarkers
│   │   └── AnomalyIndicators
│   ├── MissionDetail
│   │   ├── MissionInfo
│   │   ├── ValidationCriteria
│   │   └── SubmitButton
│   ├── MagicMomentCapture
│   │   ├── CameraInterface
│   │   ├── GeolocationDisplay
│   │   └── TimestampCounter
│   ├── VerificationQueue
│   │   ├── MagicMomentCard
│   │   ├── VerdictForm
│   │   └── ReasoningInput
│   ├── RealityStream
│   │   ├── PostCard
│   │   ├── UpvoteButton
│   │   └── CommentSection
│   ├── Profile
│   │   ├── UserStats
│   │   ├── BadgeDisplay
│   │   └── LedgerHistory
│   ├── ShadowCorpsRecruitment
│   │   ├── Manifesto
│   │   ├── OathCeremony
│   │   └── InitialMissions
│   ├── AdminDashboard
│   │   ├── ModerationQueue
│   │   ├── MissionCreator
│   │   └── Analytics
│   └── OnboardingTutorials
│       ├── RealityCrisisExplainer
│       ├── VerificationMethodology
│       └── RewardsSystem
└── NotificationCenter
```

---

## 7. Design System: Sacred Geometry & Alex Grey Aesthetic

### 7.1 Color Palette (Chakra-Inspired)

| Chakra | Color | Hex | Usage |
|--------|-------|-----|-------|
| Root | Red | #E63946 | Critical anomalies, urgent missions |
| Sacral | Orange | #F77F00 | High-priority tasks, active missions |
| Solar Plexus | Yellow | #FCBF49 | Medium priority, achievements |
| Heart | Green | #06A77D | Verified content, completed missions |
| Throat | Blue | #457B9D | Information, neutral status |
| Third Eye | Indigo | #6A4C93 | Advanced features, Shadow Corps tier |
| Crown | Violet | #C77DFF | Spiritual/sacred elements, top tier |

### 7.2 Visual Elements

**Sacred Geometry Patterns:**
- Mandala-inspired mission cards with concentric circles
- Flower of Life pattern in background textures
- Hexagonal grids for map interface
- Fibonacci spiral in leaderboard progression
- Vesica piscis overlays for verification badges

**Musical Note Motifs:**
- Staff lines as dividers between sections
- Musical notes as icons for different mission types
- Chord progressions in color transitions
- Rhythm-based animations for notifications

**Alex Grey Inspired:**
- Intricate line work in borders and dividers
- Anatomical/spiritual imagery in badges
- Translucent overlays with geometric patterns
- Glowing effects for verified content
- Eye motifs in verification UI

### 7.3 Typography

- **Headings:** Geometric sans-serif (Montserrat, Poppins)
- **Body:** Clean sans-serif (Inter, Open Sans)
- **Accents:** Serif for sacred/important text (Playfair Display)

### 7.4 Animation & Micro-interactions

- Smooth transitions between states (250-400ms)
- Pulse animations for real-time notifications
- Geometric shape morphing for state changes
- Parallax scrolling with sacred geometry layers
- Harmonic easing functions (ease-in-out-cubic)

---

## 8. Security & Cryptography

### 8.1 Magic Moment Verification

Each Magic Moment includes:
- **Timestamp:** UTC timestamp of capture
- **Geolocation:** Latitude/longitude with accuracy radius
- **User Attribution:** Cryptographically signed user ID
- **Content Hash:** SHA-256 hash of photo/video
- **Signature:** ECDSA signature of (timestamp + geolocation + user_id + content_hash)

**Verification Process:**
1. Client captures photo/video with timestamp and GPS coordinates
2. Client computes content hash and creates signature
3. Server validates signature using user's public key
4. Server stores immutable ledger entry with all components
5. Community validators verify content authenticity

### 8.2 Truth Credit Ledger

Each ledger entry includes:
- **Transaction ID:** Unique identifier
- **User ID:** Cryptographically signed
- **Amount:** Truth Credits transferred
- **Reason:** Transaction type and context
- **Timestamp:** Immutable record time
- **Signature:** ECDSA signature of all above fields

**Immutability Guarantee:**
- Ledger entries are append-only
- Each entry signs the previous entry's hash (blockchain-like)
- Tampering is cryptographically detectable
- Public audit trail available to all users

### 8.3 User Authentication

- OAuth 2.0 via Manus (no password management)
- Session cookies with secure flags
- JWT tokens for API authentication
- Rate limiting on sensitive endpoints
- CORS protection for cross-origin requests

---

## 9. Data Privacy & Sovereignty

### 9.1 Personal Data Protection

- **Minimal Collection:** Only essential data for functionality
- **User Control:** Users can export/delete their data
- **Anonymization:** Aggregated analytics don't expose individuals
- **Encryption:** Sensitive data encrypted at rest and in transit
- **Compliance:** GDPR, CCPA, and local privacy regulations

### 9.2 Geolocation Privacy

- **Opt-in Location Sharing:** Users explicitly enable location services
- **Precision Control:** Users can set location accuracy (exact, neighborhood, city)
- **Temporary Storage:** Location data retained only for active missions
- **Aggregation:** Heatmaps and analytics use aggregated, anonymized data

---

## 10. Scalability & Performance

### 10.1 Database Optimization

- **Indexing:** Strategic indexes on frequently queried fields
- **Partitioning:** Geographic partitioning for mission/anomaly tables
- **Caching:** Redis cache for leaderboards and user stats
- **Replication:** Read replicas for analytics queries

### 10.2 Frontend Performance

- **Code Splitting:** Lazy-load pages and heavy components
- **Image Optimization:** Responsive images with WebP format
- **Bundle Size:** Tree-shaking and minification
- **Service Worker:** Offline support and progressive loading

### 10.3 API Optimization

- **Pagination:** Limit result sets for large queries
- **Compression:** gzip compression for responses
- **Caching Headers:** Appropriate cache-control directives
- **GraphQL Batching:** Combine multiple queries into single request

---

## 11. Deployment & Infrastructure

### 11.1 Development Environment

- Local Node.js server with hot reload
- SQLite for local development database
- Mock Google Maps and LLM responses
- Vitest for unit and integration testing

### 11.2 Production Environment

- Node.js Express server on Manus platform
- MySQL/TiDB managed database
- AWS S3 for photo/video storage
- Google Maps API via Manus proxy
- LLM API via Manus proxy
- Manus OAuth for authentication
- Manus notification service for push alerts

### 11.3 Monitoring & Logging

- Server logs: request/response, errors, performance metrics
- Client logs: console errors, network requests, user interactions
- Analytics: user engagement, mission completion rates, Truth Credit flow
- Alerts: critical errors, anomalous behavior, performance degradation

---

## 12. Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
- Database schema and migrations
- tRPC router setup
- User authentication and profile system
- Mission CRUD operations

### Phase 2: Gamification (Weeks 3-4)
- Truth Credit ledger system
- Magic Moment capture and verification
- Experience points and progression
- Badge system

### Phase 3: Map & Spatial (Weeks 5-6)
- Google Maps integration
- Mission discovery and filtering
- Anomaly detection and visualization
- Location-based notifications

### Phase 4: Social & Community (Weeks 7-8)
- Reality Stream social feed
- Verification queue and peer review
- Leaderboards and rankings
- Community moderation

### Phase 5: Admin & Intelligence (Weeks 9-10)
- Admin dashboard and moderation tools
- LLM mission generation
- Analytics and reporting
- NADE anomaly detection simulation

### Phase 6: Design & Polish (Weeks 11-12)
- Sacred geometry UI implementation
- Alex Grey aesthetic refinement
- Onboarding tutorials
- Performance optimization

---

## 13. References

1. **Nexus OS Manifesto** - Internal specification document
2. **Reality Crisis Analysis** - Municipal infrastructure data accuracy study
3. **Blockchain-Inspired Ledger Systems** - Distributed ledger technology principles
4. **Gamification in Civic Engagement** - Research on incentive mechanisms
5. **Sacred Geometry in UI Design** - Visual harmony and user experience
6. **Google Maps API Documentation** - Spatial computing and geolocation
7. **tRPC Documentation** - Type-safe RPC framework
8. **Drizzle ORM Documentation** - Database schema and migrations

---

**Document Status:** Ready for implementation  
**Next Steps:** Create database schema and begin Phase 1 development
