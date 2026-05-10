CREATE TABLE `coach_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`stage` text NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`cost_usd` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `coach_threads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `coach_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`essay_id` text NOT NULL,
	`stage` text DEFAULT 'blank' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `derived_views_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`view_name` text NOT NULL,
	`params_hash` text NOT NULL,
	`result_json` text NOT NULL,
	`computed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	`is_dirty` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `error_patterns` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`tag` text NOT NULL,
	`description` text NOT NULL,
	`example_bad` text NOT NULL,
	`example_good` text NOT NULL,
	`fix` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `essay_errors` (
	`id` text PRIMARY KEY NOT NULL,
	`essay_id` text NOT NULL,
	`grading_result_id` text NOT NULL,
	`category` text NOT NULL,
	`tag` text NOT NULL,
	`offset_start` integer NOT NULL,
	`offset_end` integer NOT NULL,
	`original_text` text NOT NULL,
	`suggestion` text NOT NULL,
	`explanation` text NOT NULL,
	`severity` text DEFAULT 'minor' NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grading_result_id`) REFERENCES `grading_results`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `essay_rewrites` (
	`id` text PRIMARY KEY NOT NULL,
	`essay_id` text NOT NULL,
	`grading_result_id` text NOT NULL,
	`paragraph` integer NOT NULL,
	`original_text` text NOT NULL,
	`rewritten_text` text NOT NULL,
	`explanation` text NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grading_result_id`) REFERENCES `grading_results`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `essays` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text,
	`mode` text DEFAULT 'assist' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`word_count` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`timer_seconds` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`submitted_at` integer,
	`graded_at` integer,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`aggregate_id` text NOT NULL,
	`aggregate_type` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`occurred_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grading_results` (
	`id` text PRIMARY KEY NOT NULL,
	`essay_id` text NOT NULL,
	`overall_band` real NOT NULL,
	`ta_band` real NOT NULL,
	`cc_band` real NOT NULL,
	`lr_band` real NOT NULL,
	`gra_band` real NOT NULL,
	`ta_comment` text NOT NULL,
	`cc_comment` text NOT NULL,
	`lr_comment` text NOT NULL,
	`gra_comment` text NOT NULL,
	`overall_comment` text NOT NULL,
	`strengths_summary` text NOT NULL,
	`weaknesses_summary` text NOT NULL,
	`rewritten_essay` text,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`cost_usd` real DEFAULT 0 NOT NULL,
	`model` text NOT NULL,
	`raw_json` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `harness_dataset_layer1` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text,
	`essay_body` text NOT NULL,
	`human_band` real NOT NULL,
	`human_ta` real,
	`human_cc` real,
	`human_lr` real,
	`human_gra` real,
	`source` text DEFAULT 'manual' NOT NULL,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `harness_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`layer` integer NOT NULL,
	`model` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`result_json` text DEFAULT '{}' NOT NULL,
	`passed_checks` integer DEFAULT 0 NOT NULL,
	`total_checks` integer DEFAULT 0 NOT NULL,
	`cost_usd` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `question_skeletons` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`outline_json` text NOT NULL,
	`band` real NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`topic` text NOT NULL,
	`task_type` text DEFAULT 'task2' NOT NULL,
	`prompt` text NOT NULL,
	`sample_band` real,
	`difficulty_tag` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`embedding_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recommended_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`essay_id` text NOT NULL,
	`question_id` text NOT NULL,
	`reason` text NOT NULL,
	`rank` integer NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rubric_items` (
	`id` text PRIMARY KEY NOT NULL,
	`criterion` text NOT NULL,
	`band` real NOT NULL,
	`descriptor` text NOT NULL,
	`example_good` text,
	`example_bad` text
);
--> statement-breakpoint
CREATE TABLE `translation_drills` (
	`id` text PRIMARY KEY NOT NULL,
	`essay_id` text NOT NULL,
	`chinese_sentence` text NOT NULL,
	`target_english` text NOT NULL,
	`grammar_focus` text NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wordbook` (
	`id` text PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`definition` text NOT NULL,
	`example_sentence` text NOT NULL,
	`source_essay_id` text,
	`ielts_frequency` text DEFAULT 'medium',
	`added_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`source_essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wordbook_word_unique` ON `wordbook` (`word`);--> statement-breakpoint
CREATE TABLE `wordbook_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`wordbook_id` text NOT NULL,
	`essay_id` text,
	`used_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`wordbook_id`) REFERENCES `wordbook`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE no action
);
