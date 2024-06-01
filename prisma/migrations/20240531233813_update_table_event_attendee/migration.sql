-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_event_attendee" (
    "event_id" TEXT NOT NULL,
    "attendee_id" TEXT NOT NULL,
    "check_in" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("event_id", "attendee_id"),
    CONSTRAINT "event_attendee_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_attendee_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_event_attendee" ("attendee_id", "check_in", "created_at", "event_id") SELECT "attendee_id", "check_in", "created_at", "event_id" FROM "event_attendee";
DROP TABLE "event_attendee";
ALTER TABLE "new_event_attendee" RENAME TO "event_attendee";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
