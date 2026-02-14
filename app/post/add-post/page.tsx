// app/(posts)/create/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/app/(public)/_components/Sidebar";

export default function AddPostPage() {
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const src = sessionStorage.getItem("create-post-image");
    if (!src) {
      router.replace("/post/create-post");
      return;
    }
    setImageSrc(src);
  }, [router]);

  const base64ToFile = async (base64: string) => {
    const res = await fetch(base64);
    const blob = await res.blob();
    return new File([blob], "post-image.jpg", { type: blob.type });
  };

  const handleSubmit = async () => {
    if (!imageSrc) return;
    setLoading(true);

    try {
      const file = await base64ToFile(imageSrc);
      const formData = new FormData();
      formData.append("post-images", file);
      formData.append("caption", caption);
      formData.append("tags", tags);

      const res = await fetch("/api/post/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to create post");
      }

      sessionStorage.removeItem("create-post-image");
      sessionStorage.removeItem("create-post-type");
      router.push("/profile");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100/50">
      <Sidebar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] w-full max-w-[700px] aspect-[4/3] flex flex-col shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 items-center w-full border-b border-gray-100 py-4 px-6">
            <button
              onClick={() => router.back()}
              className="text-gray-800 hover:opacity-60 transition-opacity"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 tracking-tight relative inline-block">
                New Post
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gray-800 rounded-full"></span>
              </h2>
            </div>
            <div /> {/* Spacer for grid alignment */}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto custom-scrollbar">
            {/* Image Preview Container */}
            <div className="w-full max-w-[320px] mb-8">
              {imageSrc && (
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                  <img
                    src={imageSrc}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                </div>
              )}
            </div>

            {/* Inputs Container */}
            <div className="w-full max-w-[450px] space-y-6">
              <div className="relative">
                <input
                  placeholder="Write anything you want to share :)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full text-[#8e8e8e] placeholder:text-gray-300 border-b border-gray-800 py-2 outline-none text-lg transition-colors focus:border-[#cc7fac]"
                />
              </div>

              <input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full text-[#8e8e8e] placeholder:text-gray-300 border-b border-gray-800 py-2 outline-none text-sm transition-colors focus:border-[#cc7fac]"
              />

              {/* Submit Button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#cc7fac] hover:bg-[#b56996] disabled:bg-gray-300 transition-all text-white px-10 py-2.5 rounded-full font-semibold text-sm shadow-sm active:scale-95"
                >
                  {loading ? "Posting..." : "Create Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
