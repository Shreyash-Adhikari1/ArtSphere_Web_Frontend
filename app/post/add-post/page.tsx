// app/(posts)/create/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  }, []);

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

      // cleanup
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
    <div className="bg-white rounded-2xl p-10 w-[500px] shadow">
      <div className="flex items-center mb-4">
        <button onClick={() => router.back()} className="mr-2">
          ←
        </button>
        <h2 className="font-semibold">New Post</h2>
      </div>

      {imageSrc && (
        <img
          src={imageSrc}
          className="w-64 h-64 object-cover mx-auto rounded mb-4"
          alt="preview"
        />
      )}

      <input
        placeholder="Write anything you want to share :)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border-b mb-4 p-2 outline-none"
      />

      <input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full border-b mb-6 p-2 outline-none"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-pink-400 text-white w-full py-2 rounded"
      >
        {loading ? "Posting..." : "Create Post"}
      </button>
    </div>
  );
}
