import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, Test } from "@/lib/types";
import Card from "./Card";
import Link from "next/link";
import { SUBJECT_LABELS } from "@/lib/constants";

async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const allTests = (tests ?? []) as Test[];
  const totalTests = allTests.length;

  const averageScore =
    totalTests > 0
      ? Math.round(
          allTests.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) /
            totalTests
        )
      : 0;

  let weakTopics: { topic: string; wrongCount: number }[] = [];

  if (allTests.length > 0) {
    const { data: wrongAnswers } = await supabase
      .from("answers")
      .select("question_id, questions(topic)")
      .eq("correct", false)
      .in(
        "test_id",
        allTests.map((t) => t.id)
      );

    const topicCounts: Record<string, number> = {};
    wrongAnswers?.forEach((a) => {
      const q = a.questions as unknown as { topic: string } | null;
      const topic = q?.topic;
      if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    weakTopics = Object.entries(topicCounts)
      .map(([topic, wrongCount]) => ({ topic, wrongCount }))
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 5);
  }

  return {
    totalTests,
    averageScore,
    weakTopics,
    recentResults: allTests.slice(0, 5),
  };
}

export default async function DashboardStatsView({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total Tests Completed</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.totalTests}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Average Score</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.averageScore}%</p>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500">Weak Topics</p>
          {stats.weakTopics.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {stats.weakTopics.map((t) => (
                <li key={t.topic} className="flex justify-between text-sm">
                  <span>{t.topic}</span>
                  <span className="font-medium text-red-500">{t.wrongCount} wrong</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No weak topics yet — take a test!</p>
          )}
        </Card>
      </div>

      <Card title="Recent Results">
        {stats.recentResults.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recentResults.map((test) => (
              <Link
                key={test.id}
                href={`/results/${test.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {SUBJECT_LABELS[test.subject]}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                  {Math.round((test.score / test.total_questions) * 100)}%
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No tests yet. Start learning!</p>
        )}
      </Card>
    </div>
  );
}
