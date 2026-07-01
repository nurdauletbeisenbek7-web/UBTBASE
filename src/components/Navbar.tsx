"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  userEmail?: string | null;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={userEmail ? "/dashboard" : "/"} className="text-xl font-bold text-indigo-600">
          UBT BASE
        </Link>
        <div className="flex items-center gap-4">
          {userEmail ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">{userEmail}</span>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Dashboard
              </Link>
              <Link
                href="/subjects"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Subjects
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
