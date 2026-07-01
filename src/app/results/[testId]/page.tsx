import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { AIExplainButton } from "@/components/QuestionCard";
import { SUBJECT_LABELS } from "@/lib/constants";
import type { AnswerWithQuestion, Question, Test } from "@/lib/types";

async function getTestResults(testId: string, userId: string) {
  const supabase = await createClient();

  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("id", testId)
    .eq("user_id", userId)
    .single();

  if (!test) return null;

  const { data: answers } = await supabase
    .from("answers")
    .select("*, questions(*)")
    .eq("test_id", testId);

  return {
    test: test as Test,
    answers: (answers ?? []) as AnswerWithQuestion[],
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const results = await getTestResults(testId, user.id);
  if (!results) notFound();

  const { test, answers } = results;
  const percentage = Math.round((test.score / test.total_questions) * 100);
  const incorrect = answers.filter((a) => !a.correct);

  return (
    <>
      <Navbar userEmail={user.email} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
        <p className="mt-1 text-slate-600">{SUBJECT_LABELS[test.subject]}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-sm text-slate-500">Score</p>
            <p className="text-3xl font-bold text-indigo-600">
              {test.score} / {test.total_questions}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Percentage</p>
            <p className="text-3xl font-bold text-indigo-600">{percentage}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Correct</p>
            <p className="text-3xl font-bold text-green-600">{test.score}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Incorrect</p>
            <p className="text-3xl font-bold text-red-600">
              {test.total_questions - test.score}
            </p>
          </Card>
        </div>

        {incorrect.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Wrong Answers</h2>
            <div className="space-y-6">
              {incorrect.map((a) => {
                const q = a.questions as Question;
                return (
                  <Card key={a.id}>
                    <p className="font-medium text-slate-900">{q.question}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <span className="font-medium text-red-600">Your answer:</span>{" "}
                        {String.fromCharCode(65 + a.selected_answer)}){" "}
                        {q.options[a.selected_answer]}
                      </p>
                      <p>
                        <span className="font-medium text-green-600">Correct answer:</span>{" "}
                        {String.fromCharCode(65 + q.answer)}) {q.options[q.answer]}
                      </p>
                      <p className="mt-2 text-slate-600">
                        <span className="font-medium">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                    <AIExplainButton question={q} userAnswer={a.selected_answer} />
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {incorrect.length === 0 && (
          <div className="mt-8 rounded-xl bg-green-50 p-6 text-center">
            <p className="text-lg font-semibold text-green-800">Perfect score! 🎉</p>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button href={`/test/${test.subject}`} variant="primary">
            Retake Test
          </Button>
          <Button href="/dashboard" variant="secondary">
            Back to Dashboard
          </Button>
        </div>
      </main>
    </>
  );
}
