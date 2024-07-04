/*
  Warnings:

  - You are about to drop the column `check_in_after_start` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `physical_event` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `virtual_event` on the `events` table. All the data in the column will be lost.
  - Made the column `details` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `maximum_attendees` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "maximum_attendees" INTEGER NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_events" ("created_at", "details", "end_date", "id", "maximum_attendees", "slug", "start_date", "title") SELECT "created_at", "details", "end_date", "id", "maximum_attendees", "slug", "start_date", "title" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
