/*
  Warnings:

  - You are about to drop the `check_ins` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `attendees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `event_id` on the `attendees` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "check_ins_attendee_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "check_ins";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "event_attendee" (
    "event_id" TEXT NOT NULL,
    "attendee_id" TEXT NOT NULL,
    "check_in" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("event_id", "attendee_id"),
    CONSTRAINT "event_attendee_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_attendee_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attendees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_attendees" ("created_at", "email", "id", "name") SELECT "created_at", "email", "id", "name" FROM "attendees";
DROP TABLE "attendees";
ALTER TABLE "new_attendees" RENAME TO "attendees";
CREATE UNIQUE INDEX "attendees_email_key" ON "attendees"("email");
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "slug" TEXT NOT NULL,
    "maximum_attendees" INTEGER,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "virtual_event" BOOLEAN NOT NULL,
    "physical_event" BOOLEAN NOT NULL,
    "check_in_after_start" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_events" ("check_in_after_start", "details", "end_date", "id", "maximum_attendees", "physical_event", "slug", "start_date", "title", "virtual_event") SELECT "check_in_after_start", "details", "end_date", "id", "maximum_attendees", "physical_event", "slug", "start_date", "title", "virtual_event" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
