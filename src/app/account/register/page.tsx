import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/account/AuthForms";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect("/account");
  return (
    <div className="bg-slate-50">
      <div className="container-page flex justify-center py-14">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl">Create your account</h1>
          <p className="mt-1 mb-6 text-sm text-slate-600">Faster checkout, all your trips in one place, and price alerts.</p>
          <RegisterForm next={next} />
        </div>
      </div>
    </div>
  );
}
