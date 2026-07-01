import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  const { question, options, userAnswer, correctAnswer, subject, topic } =
    await request.json();

  const userAnswerText = options[userAnswer];
  const correctAnswerText = options[correctAnswer];

  const prompt = `You are a helpful UNT (Unified National Testing) tutor for Kazakhstan students.

Subject: ${subject}
Topic: ${topic}

Question: ${question}

Options:
A) ${options[0]}
B) ${options[1]}
C) ${options[2]}
D) ${options[3]}

Student's answer: ${String.fromCharCode(65 + userAnswer)}) ${userAnswerText}
Correct answer: ${String.fromCharCode(65 + correctAnswer)}) ${correctAnswerText}

Please explain in clear, student-friendly language:
1. Why the student's answer is wrong
2. The correct theory/concept needed
3. Step-by-step how to solve similar problems

Keep the explanation concise but thorough (3-4 paragraphs max).`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });

    const explanation =
      completion.choices[0]?.message?.content ?? "No explanation available.";

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
