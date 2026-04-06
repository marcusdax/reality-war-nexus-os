-- Faction Onboarding Migration
-- Adds chosenFaction to the users table to persist faction selection
-- from the cinematic onboarding flow.

ALTER TABLE `users`
  ADD COLUMN `chosenFaction` enum('eco','data','tech','shadow') NULL
  AFTER `role`;
