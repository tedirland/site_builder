CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`phase` text DEFAULT 'discovery' NOT NULL,
	`resume_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`raw_text` text DEFAULT '' NOT NULL,
	`parsed_data` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `resumes_conversation_idx` ON `resumes` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`slug` text NOT NULL,
	`profile_data` text NOT NULL,
	`template_id` text NOT NULL,
	`html` text NOT NULL,
	`css` text NOT NULL,
	`personality_applied` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sites_slug_unique` ON `sites` (`slug`);--> statement-breakpoint
CREATE INDEX `sites_conversation_idx` ON `sites` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `sites_slug_idx` ON `sites` (`slug`);