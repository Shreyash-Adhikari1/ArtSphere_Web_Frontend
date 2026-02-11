"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-toastify";

const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordDTO) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    try {
      const res = await fetch(`/api/user/reset-password?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: data.newPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Reset failed");
        return;
      }

      setSuccess(true);
      toast.success("Password reset successful!");

      setTimeout(() => router.push("/login"), 2500);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7FB] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          Reset your password
        </h1>

        {/* New password */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="New password"
            disabled={success}
            {...register("newPassword")}
            className="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-[#C974A6]"
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Confirm password"
            disabled={success}
            {...register("confirmPassword")}
            className="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-[#C974A6]"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full bg-[#C974A6] text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
        >
          {isSubmitting
            ? "Resetting…"
            : success
              ? "Password reset"
              : "Reset password"}
        </button>

        {success && (
          <p className="text-green-600 text-sm text-center mt-4">
            Redirecting you to login…
          </p>
        )}
      </form>
    </div>
  );
}
