import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { SUBJECTS } from "@/lib/constants";

export default async function SubjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <>
      <Navbar userEmail={user.email} />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Choose a Subject</h1>
        <p className="mt-2 text-slate-600">Select a subject to start a 20-question practice test</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.id}
              href={`/test/${subject.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-2xl group-hover:bg-indigo-200">
                {subject.id === "mathematics" ? "📐" : "💻"}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{subject.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{subject.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-indigo-600 group-hover:underline">
                Start Test →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
