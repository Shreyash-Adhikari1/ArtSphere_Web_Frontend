"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schema";
import { z } from "zod";
import { handleRegister } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    console.log("Triggered");

    try {
      const res = await handleRegister(data);

      console.log({ res });

      // if (!res.success) {
      //     throw new Error(res.message || "Registration failed");
      // }

      startTransition(() => {
        router.push("/login");
      });
    } catch (err: any) {
      console.log("error occured", err);

      setError(err.message || "Registration failed");
    }
  };

  const inputBg = "bg-[#F3E8EE]";
  const iconStyle =
    "absolute left-5 top-1/2 -translate-y-1/2 text-black text-lg";
  const inputStyle = `w-full py-3.5 pl-14 pr-12 rounded-full ${inputBg} text-black font-serif text-base outline-none focus:ring-2 focus:ring-[#C974A6]`;

  return (
    <div className="min-h-screen w-full bg-white flex items-center font-serif overflow-x-hidden">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center w-full"
      >
        <div
          style={{ marginLeft: "261px" }}
          className="w-[420px] flex flex-col"
        >
          <h1 className="text-5xl font-bold mb-10 text-black">Signup</h1>

          <div className="space-y-4 mb-10">
            {[
              { name: "fullName", icon: "👤", placeholder: "Full Name" },
              { name: "username", icon: "👤", placeholder: "Username" },
              { name: "email", icon: "✉️", placeholder: "Email" },
              { name: "phoneNumber", icon: "📞", placeholder: "Phone Number" },
              { name: "address", icon: "📍", placeholder: "Address" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <span className={iconStyle}>{field.icon}</span>
                <input
                  {...register(field.name as keyof RegisterFormData)}
                  placeholder={field.placeholder}
                  className={inputStyle}
                />
                {errors[field.name as keyof RegisterFormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      errors[field.name as keyof RegisterFormData]
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            ))}

            <div className="relative">
              <span className={iconStyle}>🔒</span>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={inputStyle}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <span className={iconStyle}>🔒</span>
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className={inputStyle}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#C974A6] text-white px-24 py-3 rounded-full text-lg font-bold shadow-md mb-6"
          >
            {isPending ? "Creating account..." : "Signup"}
          </button>

          <p className="text-gray-400 font-medium text-sm">
            Already registered?{" "}
            <Link href="/login" className="text-[#FF0000] font-bold">
              Login!
            </Link>
          </p>
        </div>

        <div style={{ marginLeft: "356px" }} className="hidden lg:block">
          <div className="w-[520px] h-[520px] rounded-full border flex items-center justify-center">
            <Image
              src="/images/artsphere_logo.png"
              alt=""
              width={520}
              height={520}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
