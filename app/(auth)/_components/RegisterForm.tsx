"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
    fullName: z.string().min(1, "Full Name required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(10, "Enter valid phone number"),
    address: z.string().min(1, "Address required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterData) => {
        console.log("Register Data:", data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-[400px]">
            <input {...register("fullName")} placeholder="Full Name" className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none" />
            {errors.fullName && <p className="text-red-600">{errors.fullName.message}</p>}

            <input {...register("email")} placeholder="Email" className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none" />
            {errors.email && <p className="text-red-600">{errors.email.message}</p>}

            <input {...register("phoneNumber")} placeholder="Phone Number" className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none" />
            {errors.phoneNumber && <p className="text-red-600">{errors.phoneNumber.message}</p>}

            <input {...register("address")} placeholder="Address" className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none" />
            {errors.address && <p className="text-red-600">{errors.address.message}</p>}

            <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Password" className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none w-full" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? "Hide" : "Show"}</button>
            </div>
            {errors.password && <p className="text-red-600">{errors.password.message}</p>}

            <div className="relative">
                <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="Confirm Password" className="p-3 rounded-full bg-[#C974A6]/20 border border-gray-300 focus:outline-none w-full" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-500">{showConfirm ? "Hide" : "Show"}</button>
            </div>
            {errors.confirmPassword && <p className="text-red-600">{errors.confirmPassword.message}</p>}

            <button type="submit" className="bg-[#C974A6] text-white py-3 rounded-full mt-2 hover:bg-[#B36293] transition">
                Signup
            </button>
        </form>
    );
}
