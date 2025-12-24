import LoginForm from "../_components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center h-screen bg-white gap-16">
            <LoginForm />
            <div className="w-[400px] h-[400px]">
                <Image src="/images/auth-illustration.svg" alt="Illustration" width={400} height={400} />
            </div>
        </div>
    );
}
