"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Plus, CheckCircle2 } from "lucide-react";

/* ---------- Types ---------- */

type Post = {
  _id: string;
  media?: string;
  caption?: string;
  isChallengeSubmission?: boolean;
};

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function resolvePostMedia(
  base: string,
  post?: { media?: string; isChallengeSubmission?: boolean },
) {
  const media = post?.media;
  if (!media) return "/images/artsphere_logo.png";
  if (media.startsWith("http://") || media.startsWith("https://")) return media;
  if (media.startsWith("/uploads/")) return `${base}${media}`;

  const looksLikeSubmission =
    post?.isChallengeSubmission === true ||
    media.startsWith("challenge-submissions-") ||
    media.includes("challenge-submissions");

  if (looksLikeSubmission)
    return `${base}/uploads/challenge-submissions/${media}`;
  return `${base}/uploads/post-images/${media}`;
}

/* ---------- Component ---------- */

export default function SubmitToChallengeModal({
  base,
  challengeId,
  onClose,
  onSubmitted,
}: {
  base: string;
  challengeId: string;
  onClose: () => void;
  onSubmitted: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"existing" | "new">("existing");

  // Existing posts
  const [postsLoading, setPostsLoading] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // New post
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState("");
  const [newSubmitting, setNewSubmitting] = useState(false);

  // common submit state
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");

  // Create local preview URL when file changes
  useEffect(() => {
    if (!newFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [newFile]);

  async function loadMyPosts() {
    setPostsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/post/posts/my-posts", {
        cache: "no-store",
      });
      const data = await safeJson(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load your posts");
      }

      const list: Post[] = data?.posts ?? data?.data ?? [];
      setMyPosts(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setMyPosts([]);
      setMessage(e?.message || "Failed to load your posts");
    } finally {
      setPostsLoading(false);
    }
  }

  useEffect(() => {
    loadMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitExisting() {
    if (!selectedPostId) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/submission/existing/${challengeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPostId }),
      });

      const data = await safeJson(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Submission failed");
      }

      setMessage("Submitted successfully!");
      await onSubmitted();
    } catch (e: any) {
      setMessage(e?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitNewPost() {
    if (!newFile) return;

    setNewSubmitting(true);
    setMessage("");

    try {
      const fd = new FormData();
      fd.append("challenge-submissions", newFile); // ✅ matches backend
      fd.append("caption", newCaption.trim());
      fd.append("mediaType", "image");
      fd.append("visibility", "public");

      const res = await fetch(`/api/submission/new/${challengeId}`, {
        method: "POST",
        body: fd,
      });

      const data = await safeJson(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Submission failed");
      }

      setMessage("Posted & submitted successfully!");
      await onSubmitted();
    } catch (e: any) {
      setMessage(e?.message || "Submission failed");
    } finally {
      setNewSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
        type="button"
      />

      <div className="relative w-[94%] max-w-3xl bg-white rounded-3xl shadow-xl border overflow-hidden font-serif">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-lg text-black">Submit to challenge</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("existing")}
              className={`px-4 py-2 rounded-full font-bold transition ${
                tab === "existing"
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
              type="button"
            >
              Use existing post
            </button>
            <button
              onClick={() => setTab("new")}
              className={`px-4 py-2 rounded-full font-bold transition ${
                tab === "new"
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
              type="button"
            >
              Create new post
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Status message */}
          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-2xl border text-sm ${
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("submitted")
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{message}</span>
              </div>
            </div>
          )}

          {tab === "existing" ? (
            <div>
              <div className="flex items-end justify-between mb-3">
                <p className="text-sm text-gray-500">
                  Pick one of your posts to submit (1 per challenge).
                </p>
                <button
                  onClick={loadMyPosts}
                  className="text-sm font-bold text-black hover:opacity-80"
                  type="button"
                >
                  Refresh
                </button>
              </div>

              {postsLoading ? (
                <div className="py-10 text-center text-gray-400">
                  <Loader2 className="inline animate-spin mr-2" size={18} />
                  Loading your posts…
                </div>
              ) : myPosts.length === 0 ? (
                <div className="py-10 text-center text-gray-400 italic border rounded-3xl">
                  No posts found.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {myPosts.map((p) => {
                    const img = resolvePostMedia(base, p);
                    const selected = selectedPostId === p._id;

                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => setSelectedPostId(p._id)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border transition ${
                          selected
                            ? "ring-4 ring-[#C974A6]/40 border-[#C974A6]"
                            : "hover:opacity-95"
                        }`}
                      >
                        <img
                          src={img}
                          alt="my post"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/artsphere_logo.png";
                          }}
                        />
                        {selected && (
                          <div className="absolute top-2 right-2 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded-full">
                            Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={submitExisting}
                disabled={submitting || !selectedPostId}
                className={`mt-6 w-full py-3 rounded-full font-bold transition ${
                  submitting || !selectedPostId
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#C974A6] text-white hover:opacity-90"
                }`}
                type="button"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin" size={18} />
                    Submitting…
                  </span>
                ) : (
                  "Submit selected post"
                )}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Upload a new image and submit it directly to this challenge.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-3xl p-4 bg-[#FFF6ED] border-orange-50">
                  <p className="text-sm font-bold text-black mb-2 inline-flex items-center gap-2">
                    <Plus size={16} className="text-[#C974A6]" />
                    Upload image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />

                  {/* ✅ Preview */}
                  <div className="mt-4">
                    {previewUrl ? (
                      <div className="rounded-2xl overflow-hidden border bg-white">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-56 rounded-2xl border bg-white flex items-center justify-center text-gray-300">
                        Select an image to preview
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Field name is <b>challenge-submissions</b>.
                  </p>
                </div>

                <div className="border rounded-3xl p-4 bg-white">
                  <p className="text-sm font-bold text-black mb-2">
                    Caption (optional)
                  </p>
                  <textarea
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30 min-h-30"
                    placeholder="Describe your submission…"
                  />
                </div>
              </div>

              <button
                onClick={submitNewPost}
                disabled={newSubmitting || !newFile}
                className={`mt-6 w-full py-3 rounded-full font-bold transition ${
                  newSubmitting || !newFile
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:opacity-90"
                }`}
                type="button"
              >
                {newSubmitting ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin" size={18} />
                    Uploading & submitting…
                  </span>
                ) : (
                  "Create post & submit"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
