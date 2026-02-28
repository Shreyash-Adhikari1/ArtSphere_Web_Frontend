"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { handleLogin } from "@/lib/actions/auth-action";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      const res = await handleLogin(data);
      if (!res.success) {
        throw new Error(res.message || "Login Failed");
      }

      startTransition(() => {
        router.push("/auth/dashboard");
      });
    } catch (err: any) {
      setError(err.message || "Login Failed");
    }
  };

  return (
    <div
      data-testid="login-container"
      className="flex min-h-screen items-center justify-center bg-white"
    >
      <div className="flex w-full max-w-6xl items-center justify-around p-10">
        {/* Left Side: Form */}
        <form
          noValidate
          data-testid="login-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full max-w-sm"
        >
          <h1
            data-testid="login-title"
            className="text-5xl font-bold mb-12 text-black"
          >
            Login
          </h1>

          <div className="space-y-6 mb-10">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                📧
              </span>

              <input
                data-testid="login-email"
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full py-4 pl-12 pr-4 rounded-full bg-[#F3E8EE] text-black outline-none focus:ring-2 focus:ring-[#C974A6]"
              />

              {errors.email && (
                <p
                  data-testid="login-email-error"
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔒
              </span>

              <input
                data-testid="login-password"
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full py-4 pl-12 pr-12 rounded-full bg-[#F3E8EE] text-black outline-none focus:ring-2 focus:ring-[#C974A6]"
              />

              {errors.password && (
                <p
                  data-testid="login-password-error"
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              data-testid="login-submit"
              type="submit"
              className="bg-[#C974A6] text-white px-20 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition shadow-md"
            >
              Login
            </button>

            <Link
              data-testid="login-forgot-link"
              href="/request-password-reset"
              className="text-[#FF0000] text-sm font-bold hover:underline"
            >
              forgot your password?
            </Link>
          </div>

          {error && (
            <p
              data-testid="login-server-error"
              className="text-red-500 text-sm text-center mt-4"
            >
              {error}
            </p>
          )}

          <div className="mt-12 text-center text-gray-500 font-medium">
            Don't have an Account?{" "}
            <Link
              data-testid="login-signup-link"
              href="/register"
              className="text-[#FF0000] font-bold"
            >
              Signup!
            </Link>
          </div>
        </form>

        {/* Right Side: Illustration */}
        <div className="hidden lg:block relative">
          <div className="w-112.5 h-112.5 rounded-full overflow-hidden border-2 border-gray-100 flex items-center justify-center">
            <Image
              data-testid="login-logo"
              src="/images/artsphere_logo.png"
              alt="ArtSphere Illustration"
              width={450}
              height={450}
              className="object-contain p-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
