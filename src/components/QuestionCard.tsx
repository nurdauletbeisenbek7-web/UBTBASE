"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  selected: number | null;
  onSelect: (index: number) => void;
}

export default function QuestionCard({
  question,
  index,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
          {index + 1}
        </span>
        <p className="text-base font-medium text-slate-900">{question.question}</p>
      </div>
      <div className="space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition-colors ${
              selected === i
                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            <span className="mr-2 font-semibold text-slate-500">
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AIExplainButtonProps {
  question: Question;
  userAnswer: number;
}

export function AIExplainButton({ question, userAnswer }: AIExplainButtonProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          userAnswer,
          correctAnswer: question.answer,
          subject: question.subject,
          topic: question.topic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get explanation");
      setExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {!explanation && (
        <button
          onClick={handleExplain}
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Explaining..." : "Explain with AI"}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {explanation && (
        <div className="mt-3 rounded-lg bg-violet-50 p-4 text-sm text-slate-700">
          <p className="mb-1 font-semibold text-violet-800">AI Explanation</p>
          <div className="whitespace-pre-wrap">{explanation}</div>
        </div>
      )}
    </div>
  );
}
