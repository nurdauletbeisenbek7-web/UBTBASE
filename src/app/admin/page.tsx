"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { Subject } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject>("mathematics");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, question, options, answer, explanation }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error(data.error || "Failed to add question");
      }

      setMessage({ type: "success", text: "Question added successfully!" });
      setTopic("");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer(0);
      setExplanation("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin — Add Question</h1>
        <p className="mt-1 text-slate-600">Add new questions to the question bank</p>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              >
                <option value="mathematics">Mathematics</option>
                <option value="informatics">Informatics</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="e.g. Algebra"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="Enter the question text"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Answer Options
              </label>
              {options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  required
                  className="mb-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Correct Answer
              </label>
              <select
                value={answer}
                onChange={(e) => setAnswer(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              >
                {options.map((_, i) => (
                  <option key={i} value={i}>
                    {String.fromCharCode(65 + i)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Explanation
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                required
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="Explain the correct answer"
              />
            </div>

            {message && (
              <p
                className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {message.text}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Question"}
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
