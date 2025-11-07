ALTER TABLE "packages" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;