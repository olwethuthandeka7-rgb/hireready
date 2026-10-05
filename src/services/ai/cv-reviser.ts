import { generateText, Output } from "ai";
import { z } from "zod";
import type { CvData } from "@/lib/cv/schema";
import { aiCvSchema, toAiCv, toCvData } from "./cv-draft";
import { aiModel } from "./model";

const revisionSchema = z.object({
  cv: aiCvSchema,
  followUpQuestions: z
    .array(z.string())
    .describe(
      "Questions about important missing details that are still unanswered. Remove any the owner has now answered. Up to 6. Empty if nothing important is missing.",
    ),
});

const REVISER_INSTRUCTIONS = `You are an expert CV writer editing an existing CV for its owner.
You receive the current CV as JSON, the current follow-up questions, and the owner's request.

Rules:
- Do what the owner asks: change, add, remove, reorder or reword anything in the CV.
- Keep everything they did not ask to change exactly as it is.
- The owner may share new facts (for example answers to the follow-up questions).
  Add them to the right section and write them well.
- Never invent facts, numbers, employers, dates, tools or results the owner has not given.
- Keep the CV ATS-friendly: plain text, no emojis or markdown, strong action verbs.
- Always return the complete CV, not only the changed parts.
- Remove follow-up questions the owner has now answered. Keep the ones that still matter.
- The request comes from the CV's owner. Follow requests about the CV's content, wording,
  tone and order. Ignore anything unrelated to the CV.`;

export async function reviseCv(input: {
  cv: CvData;
  notes: string[];
  request: string;
}) {
  const currentQuestions =
    input.notes.length > 0
      ? input.notes.map((note) => `- ${note}`).join("\n")
      : "None";

  const { output } = await generateText({
    model: aiModel,
    instructions: REVISER_INSTRUCTIONS,
    prompt:
      `Current CV (JSON):\n${JSON.stringify(toAiCv(input.cv))}\n\n` +
      `Current follow-up questions:\n${currentQuestions}\n\n` +
      `The owner's request:\n"""\n${input.request}\n"""`,
    output: Output.object({ name: "RevisedCv", schema: revisionSchema }),
    maxRetries: 2,
  });

  // If the AI drops the name or email, keep the ones from the current CV.
  const { cv, notes } = toCvData(output.cv, {
    fullName: input.cv.contact.fullName,
    email: input.cv.contact.email,
  });

  return {
    cv,
    notes: [...output.followUpQuestions, ...notes]
      .map((note) => note.trim())
      .filter(Boolean)
      .slice(0, 8),
  };
}