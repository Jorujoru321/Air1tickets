import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/AuthForms";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
  return (
    <div className="bg-slate-50">
      <div className="container-page flex justify-center py-14">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl">Sign in</h1>
          <p className="mt-1 mb-6 text-sm text-slate-600">See your trips, price alerts and saved details.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
