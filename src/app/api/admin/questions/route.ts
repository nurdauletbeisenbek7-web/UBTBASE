import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subject, topic, question, options, answer, explanation } =
    await request.json();

  if (!subject || !topic || !question || !options || answer === undefined || !explanation) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  if (!Array.isArray(options) || options.length !== 4) {
    return NextResponse.json({ error: "Exactly 4 options required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({ subject, topic, question, options, answer, explanation })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
