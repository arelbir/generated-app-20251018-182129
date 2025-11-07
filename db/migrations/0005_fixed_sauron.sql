ALTER TABLE "staff" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;