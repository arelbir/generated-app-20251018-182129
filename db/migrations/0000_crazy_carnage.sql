CREATE TABLE "measurements" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"date" text NOT NULL,
	"weight" real NOT NULL,
	"height" integer NOT NULL,
	"bodyFatPercentage" real,
	"waist" integer NOT NULL,
	"hips" integer NOT NULL,
	"chest" integer,
	"arms" integer,
	"thighs" integer
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"fullName" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"joinDate" text NOT NULL,
	"status" text NOT NULL,
	"gender" text NOT NULL,
	"isVeiled" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"name" text NOT NULL,
	"deviceName" text NOT NULL,
	"startDate" text NOT NULL,
	"endDate" text NOT NULL,
	"totalSessions" integer NOT NULL,
	"sessionsRemaining" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"subDeviceId" text NOT NULL,
	"startTime" text NOT NULL,
	"duration" integer NOT NULL,
	"status" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;