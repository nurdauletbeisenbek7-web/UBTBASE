"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import Button from "@/components/Button";
import type { Question, Subject } from "@/lib/types";
import { SUBJECT_LABELS } from "@/lib/constants";

export default function TestPage() {
  const params = useParams();
  const subject = params.subject as Subject;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(`/api/tests?subject=${subject}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load questions");
        setQuestions(data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [subject]);

  const handleSelect = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  async function handleSubmit() {
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          answers: questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: answers[q.id],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit test");
      router.push(`/results/${data.testId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setSubmitting(false);
    }
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {SUBJECT_LABELS[subject]} Test
            </h1>
            <p className="text-sm text-slate-600">
              {answeredCount} / {questions.length} answered
            </p>
          </div>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{
                width: questions.length
                  ? `${(answeredCount / questions.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center text-slate-500">Loading questions...</div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                selected={answers[q.id] ?? null}
                onSelect={(idx) => handleSelect(q.id, idx)}
              />
            ))}

            <div className="sticky bottom-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
