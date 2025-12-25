"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schema";
import { z } from "zod";
import { useRouter } from "next/navigation";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        console.log("Login data:", data);

        // simulate successful login
        router.push("/auth/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex w-full max-w-6xl items-center justify-around p-10">

                {/* Left Side: Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col w-full max-w-sm"
                >
                    <h1 className="text-5xl font-bold mb-12 text-black">Login</h1>

                    <div className="space-y-6 mb-10">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">📧</span>
                            <input
                                type="email"
                                placeholder="Email"
                                {...register("email")}
                                className="w-full py-4 pl-12 pr-4 rounded-full bg-[#F3E8EE] text-black outline-none focus:ring-2 focus:ring-[#C974A6]"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2">🔒</span>
                            <input
                                type="password"
                                placeholder="Password"
                                {...register("password")}
                                className="w-full py-4 pl-12 pr-12 rounded-full bg-[#F3E8EE] text-black outline-none focus:ring-2 focus:ring-[#C974A6]"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <button
                            type="submit"
                            className="bg-[#C974A6] text-white px-20 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition shadow-md"
                        >
                            Login
                        </button>

                        <Link
                            href="#"
                            className="text-[#FF0000] text-sm font-bold hover:underline"
                        >
                            forgot your password?
                        </Link>
                    </div>

                    <div className="mt-12 text-center text-gray-500 font-medium">
                        Don't have an Account?{" "}
                        <Link href="/register" className="text-[#FF0000] font-bold">
                            Signup!
                        </Link>
                    </div>
                </form>

                {/* Right Side: Illustration */}
                <div className="hidden lg:block relative">
                    <div className="w-[450px] h-[450px] rounded-full overflow-hidden border-2 border-gray-100 flex items-center justify-center">
                        <Image
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
