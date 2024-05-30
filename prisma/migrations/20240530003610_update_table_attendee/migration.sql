/*
  Warnings:

  - Added the required column `code` to the `attendees` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attendees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_attendees" ("created_at", "email", "id", "name") SELECT "created_at", "email", "id", "name" FROM "attendees";
DROP TABLE "attendees";
ALTER TABLE "new_attendees" RENAME TO "attendees";
CREATE UNIQUE INDEX "attendees_code_key" ON "attendees"("code");
CREATE UNIQUE INDEX "attendees_email_key" ON "attendees"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
