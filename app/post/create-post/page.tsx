"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Sidebar from "@/app/(public)/_components/Sidebar";

export default function CreatePostPage() {
  const router = useRouter();

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      sessionStorage.setItem("create-post-image", reader.result as string);
      sessionStorage.setItem("create-post-type", file.type);
      router.push("/post/add-post");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen bg-gray-100/50">
      <Sidebar />

      <main className="flex-1 flex items-center justify-center p-4">
        {/* Main Modal-style Container */}
        <div className="bg-white rounded-[32px] w-full max-w-[700px] aspect-[4/3] flex flex-col items-center justify-center shadow-sm border border-gray-100">
          {/* Header */}
          <div className="w-full border-b border-gray-100 py-4 text-center">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight relative inline-block">
              Create your post
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gray-800 rounded-full"></span>
            </h2>
          </div>

          {/* Upload Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
            {/* Camera Icon with Flash Lines */}
            <div className="relative mb-6">
              <Camera size={80} strokeWidth={1.5} className="text-black" />
              {/* Flash accent lines */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-[2px] h-3 bg-black rotate-[-20deg]"></div>
                <div className="w-[2px] h-4 bg-black"></div>
                <div className="w-[2px] h-3 bg-black rotate-[20deg]"></div>
              </div>
            </div>

            <p className="text-[#8e8e8e] text-xl font-medium mb-8">
              Select photos and videos from your device
            </p>

            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleSelect}
              />
              <div className="bg-[#cc7fac] hover:bg-[#b56996] transition-colors text-white px-8 py-2.5 rounded-full font-semibold text-sm shadow-sm active:scale-95 transition-transform">
                Select from Computer
              </div>
            </label>
          </div>
        </div>
      </main>
    </div>
  );
}
