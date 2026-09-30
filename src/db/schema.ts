import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import type { CvData } from "@/lib/cv/schema";

// How the CV was created.
export const cvSourceEnum = pgEnum("cv_source", [
  "uploaded",
  "ai_assistant",
  "blank",
]);

export const cvs = pgTable(
  "cvs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // The owner. If a user deletes their account, their CVs are deleted too.
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("My CV"),
    source: cvSourceEnum("source").notNull(),
    // The full structured CV, validated by cvSchema before saving.
    data: jsonb("data").$type<CvData>().notNull(),
    // The user's main CV, used by default when analysing jobs.
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  // Makes "find all CVs for this user" fast.
  (table) => [index("cvs_user_id_idx").on(table.userId)],
).enableRLS(); // Blocks access through the public browser key.

export type CvRow = typeof cvs.$inferSelect;
export type NewCvRow = typeof cvs.$inferInsert;