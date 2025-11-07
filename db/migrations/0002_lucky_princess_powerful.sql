CREATE TABLE "health_conditions" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"conditionName" text NOT NULL,
	"severity" text NOT NULL,
	"description" text,
	"diagnosedDate" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "specializations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"displayName" text NOT NULL,
	"description" text,
	"deviceCount" integer DEFAULT 1 NOT NULL,
	"sessionDuration" integer DEFAULT 60 NOT NULL,
	"pricePerSession" real,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"fullName" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"specializationId" text,
	"hireDate" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"workingHours" text,
	"notes" text,
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_specializationId_specializations_id_fk" FOREIGN KEY ("specializationId") REFERENCES "public"."specializations"("id") ON DELETE no action ON UPDATE no action;