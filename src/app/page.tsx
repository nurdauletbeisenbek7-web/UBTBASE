import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar userEmail={user?.email} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            ЕНТ / UNT Preparation
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            UBT <span className="text-indigo-600">BASE</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600">
            AI-powered UNT preparation platform.
          </p>
          <p className="mt-3 text-base text-slate-500">
            Practice Mathematics and Informatics with instant feedback and AI explanations.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={user ? "/subjects" : "/signup"} variant="primary">
              Start Learning
            </Button>
            <Button href="/login" variant="outline">
              Login
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { title: "20 Questions", desc: "Full-length practice tests per subject" },
            { title: "AI Explanations", desc: "Understand mistakes with OpenAI-powered help" },
            { title: "Track Progress", desc: "Dashboard with scores and weak topics" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <h3 className="font-semibold text-indigo-600">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
