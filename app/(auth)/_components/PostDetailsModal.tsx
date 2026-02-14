"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Loader2, Send } from "lucide-react";
import type { GridPost } from "./PostGrid";

type CommentUser = {
  _id: string;
  username?: string;
  avatar?: string;
};

type Comment = {
  _id: string;
  commentText: string;
  createdAt?: string;
  userId: CommentUser; // populated (username avatar)
};

function resolvePostPath(post: GridPost) {
  if (!post.media) return null;
  if (post.isChallengeSubmission)
    return `/uploads/challenge-submissions/${post.media}`;
  return `/uploads/post-images/${post.media}`;
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export default function PostDetailsModal({
  open,
  post,
  canDelete,
  onClose,
  onDeleted,
  onPostUpdated,
}: {
  open: boolean;
  post: GridPost | null;
  canDelete: boolean;
  onClose: () => void;
  onDeleted: (postId: string) => void;
  onPostUpdated?: (updated: Partial<GridPost> & { _id: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const postId = useMemo(() => (post ? String(post._id) : ""), [post]);

  useEffect(() => {
    if (!open || !postId) return;

    (async () => {
      setCommentsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/comment/post/${postId}`, {
          cache: "no-store",
        });
        const data = await safeJson(res);

        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load comments");
        }

        setComments(Array.isArray(data?.comments) ? data.comments : []);
      } catch (e: any) {
        setComments([]);
        setError(e?.message || "Failed to load comments");
      } finally {
        setCommentsLoading(false);
      }
    })();
  }, [open, postId]);

  if (!open || !post) return null;

  const path = resolvePostPath(post);

  async function handleDelete() {
    if (!postId) return;

    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/post/delete/${postId}`, {
        method: "DELETE",
      });
      const data = await safeJson(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to delete post");
      }

      onDeleted(postId);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendComment() {
    const text = commentText.trim();
    if (!text || !postId) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/comment/create/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText: text }),
      });

      const data = await safeJson(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to comment");
      }

      // Your controller returns: { comment }
      const newComment: Comment | undefined = data?.comment;
      if (newComment?._id) {
        setComments((prev) => [newComment, ...prev]);
      } else {
        // fallback: refetch if backend doesn't return new comment object
        const refetch = await fetch(`/api/comment/post/${postId}`, {
          cache: "no-store",
        });
        const refData = await safeJson(refetch);
        setComments(Array.isArray(refData?.comments) ? refData.comments : []);
      }

      setCommentText("");

      // Optimistically bump comment count in parent grid
      onPostUpdated?.({
        _id: postId,
        commentCount: (post?.commentCount ?? 0) + 1,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to comment");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
        type="button"
      />

      {/* modal */}
      <div className="relative w-[95%] max-w-4xl bg-white rounded-3xl shadow-xl border overflow-hidden font-serif">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="font-bold text-black">Post</div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`p-2 rounded-full hover:bg-gray-100 transition ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
                title="Delete post"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* left: image */}
          <div className="bg-black/5 border-b md:border-b-0 md:border-r">
            <div className="aspect-square w-full bg-gray-100 overflow-hidden">
              {path ? (
                <img
                  src={`/api/image?path=${encodeURIComponent(path)}`}
                  alt="post"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/images/artsphere_logo.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No media
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t text-sm text-gray-600 flex items-center justify-between">
              <span>
                ♥ <b className="text-black">{post.likeCount ?? 0}</b>
              </span>
              <span>
                💬 <b className="text-black">{post.commentCount ?? 0}</b>
              </span>
            </div>
          </div>

          {/* right: comments */}
          <div className="flex flex-col">
            <div className="px-5 py-4 border-b">
              <p className="text-sm font-bold text-black">Comments</p>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <div className="flex-1 overflow-auto max-h-[55vh]">
              {commentsLoading ? (
                <div className="py-10 text-center text-gray-400">
                  <Loader2 className="inline animate-spin mr-2" size={18} />
                  Loading comments…
                </div>
              ) : comments.length === 0 ? (
                <div className="py-10 text-center text-gray-400 italic">
                  No comments yet
                </div>
              ) : (
                <div className="divide-y">
                  {comments.map((c) => (
                    <div key={c._id} className="px-5 py-4 flex gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border bg-gray-100">
                        <img
                          src={
                            c.userId?.avatar
                              ? `/api/image?path=${encodeURIComponent(
                                  `/uploads/profile-image/${c.userId.avatar}`,
                                )}`
                              : "/images/default-avatar.png"
                          }
                          alt="avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/default-avatar.png";
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">
                          @{c.userId?.username || "user"}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {c.commentText}
                        </p>
                        {c.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* add comment */}
            <div className="px-5 py-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 px-4 py-2 rounded-full border outline-none focus:ring-2 focus:ring-[#C974A6]/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendComment();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={sending || !commentText.trim()}
                  className={`px-4 py-2 rounded-full font-bold transition ${
                    sending || !commentText.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#C974A6] text-white hover:opacity-90"
                  }`}
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* footer spacer */}
      </div>
    </div>
  );
}
