import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCvForUser } from "@/db/queries/cvs";
import { createClient } from "@/lib/supabase/server";
import { exportCvFile } from "@/services/cv-export";

export const runtime = "nodejs";

const formatSchema = z.enum(["pdf", "docx"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Log in to download CVs." },
      { status: 401 },
    );
  }

  const format = formatSchema.safeParse(
    request.nextUrl.searchParams.get("format"),
  );
  if (!format.success) {
    return NextResponse.json(
      { error: "Choose a format: pdf or docx." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const cv = await getCvForUser(user.id, id);
  if (!cv) {
    return NextResponse.json({ error: "CV not found." }, { status: 404 });
  }

  return exportCvFile(cv.data, format.data);
}