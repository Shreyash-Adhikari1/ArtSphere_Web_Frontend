// app/(posts)/create/page.tsx
"use client";

import { useRouter } from "next/navigation";

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
    <div className="bg-white rounded-2xl p-10 w-[420px] text-center shadow">
      <h2 className="font-semibold mb-6">Create your post</h2>

      <div className="border-2 border-dashed rounded-xl p-8">
        <p className="mb-4 text-gray-500">
          Select photos and videos from your device
        </p>

        <label>
          <input type="file" accept="image/*" hidden onChange={handleSelect} />
          <span className="cursor-pointer bg-pink-400 text-white px-4 py-2 rounded">
            Select from Computer
          </span>
        </label>
      </div>
    </div>
  );
}
