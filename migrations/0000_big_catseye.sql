CREATE TABLE "cron_jobs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"schedule" text NOT NULL,
	"body" text,
	"cron_secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'JIMEX-X' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "execution_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"response_code" integer,
	"duration" integer,
	"error_message" text
);
