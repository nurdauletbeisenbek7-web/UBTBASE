import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QUESTIONS_PER_TEST } from "@/lib/constants";
import type { Subject, TestSubmission } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: TestSubmission = await request.json();
  const { subject, answers } = body;

  if (!subject || !answers?.length) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const questionIds = answers.map((a) => a.questionId);
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, answer")
    .in("id", questionIds);

  if (qError || !questions) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }

  const answerMap = new Map(questions.map((q) => [q.id, q.answer]));
  let score = 0;

  const answerRecords = answers.map((a) => {
    const correct = answerMap.get(a.questionId) === a.selectedAnswer;
    if (correct) score++;
    return {
      question_id: a.questionId,
      selected_answer: a.selectedAnswer,
      correct,
    };
  });

  const { data: test, error: testError } = await supabase
    .from("tests")
    .insert({
      user_id: user.id,
      subject: subject as Subject,
      score,
      total_questions: answers.length,
    })
    .select("id")
    .single();

  if (testError || !test) {
    return NextResponse.json({ error: "Failed to save test" }, { status: 500 });
  }

  const { error: answersError } = await supabase.from("answers").insert(
    answerRecords.map((a) => ({
      test_id: test.id,
      ...a,
    }))
  );

  if (answersError) {
    return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
  }

  return NextResponse.json({ testId: test.id, score, total: answers.length });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");

  if (!subject) {
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("get_random_questions", {
    p_subject: subject,
    p_limit: QUESTIONS_PER_TEST,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data });
}
