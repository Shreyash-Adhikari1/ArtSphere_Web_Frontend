import RegisterForm from "../_components/RegisterForm";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="flex justify-center items-center h-screen bg-white gap-16">
            <RegisterForm />
        </div>
    );
}
