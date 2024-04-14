/*
  Warnings:

  - Added the required column `check_in_after_start` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `physical_event` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `virtual_event` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "check_in_after_start" BOOLEAN NOT NULL
);
INSERT INTO "new_events" ("details", "id", "maximum_attendees", "slug", "title") SELECT "details", "id", "maximum_attendees", "slug", "title" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
