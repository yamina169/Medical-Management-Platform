"use client";

import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <section className="min-h-screen flex items-center justify-center bg-lightBg px-5">
      {!token ? <ResetPasswordForm /> : <ChangePasswordForm token={token} />}
    </section>
  );
}
