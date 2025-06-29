CREATE TABLE `subtasks` (
	`id` text PRIMARY KEY NOT NULL,
	`todo_id` text NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`todo_id`) REFERENCES `todos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`tags` text DEFAULT '[]',
	`due_date` integer,
	`completed_at` integer,
	`estimated_minutes` integer,
	`actual_minutes` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
