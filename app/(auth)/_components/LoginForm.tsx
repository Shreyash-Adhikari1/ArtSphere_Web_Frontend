"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginData) => {
        console.log("Login Data:", data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-[400px]">
            <input
                {...register("email")}
                placeholder="Email"
                className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none"
            />
            {errors.email && <p className="text-red-600">{errors.email.message}</p>}

            <div className="relative">
                <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none w-full"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>
            {errors.password && <p className="text-red-600">{errors.password.message}</p>}

            <button
                type="submit"
                className="bg-[#C974A6] text-white py-3 rounded-full mt-2 hover:bg-[#B36293] transition"
            >
                Login
            </button>
        </form>
    );
}
