import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sampleCv } from "@/lib/cv/sample";
import { createClient } from "@/lib/supabase/server";
import { exportCvFile } from "@/services/cv-export";

// PDF and Word generation need the full Node.js runtime.
export const runtime = "nodejs";

const formatSchema = z.enum(["pdf", "docx"]);

export async function GET(request: NextRequest) {
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

  return exportCvFile(sampleCv, format.data);
}