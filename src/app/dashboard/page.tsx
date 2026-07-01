import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import DashboardStatsView from "@/components/DashboardStats";
import Button from "@/components/Button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <>
      <Navbar userEmail={user.email} />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-600">Track your UNT preparation progress</p>
          </div>
          <div className="flex gap-3">
            <Button href="/subjects" variant="primary">
              Start Test
            </Button>
            {isAdminEmail(user.email) && (
              <Button href="/admin" variant="secondary">
                Admin
              </Button>
            )}
          </div>
        </div>
        <DashboardStatsView userId={user.id} />
      </main>
    </>
  );
}
