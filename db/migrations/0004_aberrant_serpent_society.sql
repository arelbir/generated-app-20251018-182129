ALTER TABLE "sessions" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;