import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cvs, cvSourceEnum } from "@/db/schema";
import { cvSchema, type CvData } from "@/lib/cv/schema";

// SECURITY RULE: every function here takes the user's ID and always
// filters by it, so one user can never read or change another's CV.

export type CvSource = (typeof cvSourceEnum.enumValues)[number];

// CV ids are UUIDs. Checking first avoids a database error
// when someone types a broken id into the web address.
function isValidId(id: string) {
  return z.uuid().safeParse(id).success;
}

export async function listCvsForUser(userId: string) {
  return db
    .select({
      id: cvs.id,
      title: cvs.title,
      source: cvs.source,
      isPrimary: cvs.isPrimary,
      updatedAt: cvs.updatedAt,
    })
    .from(cvs)
    .where(eq(cvs.userId, userId))
    .orderBy(desc(cvs.isPrimary), desc(cvs.updatedAt));
}

export async function getCvForUser(userId: string, cvId: string) {
  if (!isValidId(cvId)) return null;

  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);

  return row ?? null;
}

export async function createCvForUser(
  userId: string,
  input: { title?: string; source: CvSource; data: CvData; notes?: string[] },
) {
  // Never trust data just because it has the right TypeScript type.
  // Validate it again right before it reaches the database.
  const data = cvSchema.parse(input.data);

  // A user's first CV automatically becomes their main one.
  const existing = await db
    .select({ id: cvs.id })
    .from(cvs)
    .where(eq(cvs.userId, userId))
    .limit(1);

  const [row] = await db
    .insert(cvs)
    .values({
      userId,
      title: input.title?.trim() || "My CV",
      source: input.source,
      data,
      notes: input.notes ?? [],
      isPrimary: existing.length === 0,
    })
    .returning();

  return row;
}

export async function updateCvForUser(
  userId: string,
  cvId: string,
  input: { data: CvData; notes?: string[] },
) {
  if (!isValidId(cvId)) return null;

  const data = cvSchema.parse(input.data);

  const [row] = await db
    .update(cvs)
    .set(input.notes ? { data, notes: input.notes } : { data })
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .returning();

  return row ?? null;
}

export async function deleteCvForUser(userId: string, cvId: string) {
  if (!isValidId(cvId)) return false;

  const deleted = await db
    .delete(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .returning({ id: cvs.id });

  return deleted.length > 0;
}