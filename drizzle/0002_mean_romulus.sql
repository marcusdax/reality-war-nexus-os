ALTER TABLE `users` MODIFY COLUMN `oathTaken` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `oathTaken` int NOT NULL DEFAULT 0;