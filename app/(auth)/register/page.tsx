import RegisterForm from "../_components/RegisterForm";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="flex justify-center items-center h-screen bg-white gap-16">
            <RegisterForm />
            <div className="w-[400px] h-[400px]">
                <Image src="/images/auth-illustration.svg" alt="Illustration" width={400} height={400} />
            </div>
        </div>
    );
}
