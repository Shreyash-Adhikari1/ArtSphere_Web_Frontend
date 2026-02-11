"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useState } from "react";

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type RequestPasswordResetDTO = z.infer<
  typeof RequestPasswordResetSchema
>;

export default function Page() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<RequestPasswordResetDTO>({
    resolver: zodResolver(RequestPasswordResetSchema),
  });

  const onSubmit = async (data: RequestPasswordResetDTO) => {
    try {
      const res = await fetch("/api/user/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const response = await res.json();

      if (!res.ok || response?.success === false) {
        throw new Error(
          response?.message || "Failed to request password reset",
        );
      }
      setSent(true); // 👈 important
      toast.success("Password reset link sent to your email 📧");
    } catch (error: any) {
      toast.error(error?.message || "Failed to request password reset");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF6ED] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
        <h1 className="text-2xl font-bold text-black mb-2">
          Forgot your password?
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-1"
            >
              Email address
            </label>

            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`w-full rounded-xl border px-4 py-2 text-black outline-none focus:ring-2 focus:ring-[#C974A6]
                ${errors.email ? "border-red-400" : "border-gray-300"}`}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || sent}
            className="w-full rounded-xl bg-[#C974A6] text-white py-2.5 font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {isSubmitting
              ? "Sending…"
              : sent
                ? "Reset link sent"
                : "Send reset link"}
          </button>
          {sent && (
            <p className="text-sm text-green-600 mt-3 text-center">
              Check your inbox and spam folder for the reset link.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
