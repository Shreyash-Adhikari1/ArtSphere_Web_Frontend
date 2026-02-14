"use client";

import { useEffect, useRef, useState } from "react";
import { X, Trash2 } from "lucide-react";

type CommentUser = {
  _id: string;
  username: string;
  avatar?: string;
};

export type PostComment = {
  _id: string;
  commentText: string;
  likeCount: number;
  userId: CommentUser; // populated by backend
  createdAt: string;
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  return `${d}d`;
}

export default function CommentsModal({
  postId,
  open,
  onClose,
  onCommentCountDelta,
}: {
  postId: string;
  open: boolean;
  onClose: () => void;
  onCommentCountDelta: (delta: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement | null>(null);

  async function loadComments() {
    setLoading(true);
    const res = await fetch(`/api/comment/post/${postId}`, {
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (res.ok) setComments(data?.comments || []);
    else setComments([]);

    setLoading(false);
  }

  async function createComment() {
    const trimmed = text.trim();
    if (!trimmed || posting) return;

    setPosting(true);

    // optimistic comment (temporary)
    const tempId = `temp-${Date.now()}`;
    const optimistic: PostComment = {
      _id: tempId,
      commentText: trimmed,
      likeCount: 0,
      userId: { _id: "me", username: "You" }, // will be replaced by reload
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [optimistic, ...prev]);
    setText("");
    onCommentCountDelta(1);

    const res = await fetch(`/api/comment/create/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentText: trimmed }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // rollback optimistic
      setComments((prev) => prev.filter((c) => c._id !== tempId));
      onCommentCountDelta(-1);
    } else {
      const created = data?.comment as PostComment | undefined;
      if (created?._id) {
        setComments((prev) => [
          created,
          ...prev.filter((c) => c._id !== tempId),
        ]);
      } else {
        await loadComments();
      }
    }

    setPosting(false);
  }

  async function deleteComment(commentId: string) {
    if (deletingMap[commentId]) return;

    setDeletingMap((m) => ({ ...m, [commentId]: true }));

    // optimistic remove
    const snapshot = comments;
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    onCommentCountDelta(-1);

    const res = await fetch(`/api/comment/delete/${commentId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      // rollback
      setComments(snapshot);
      onCommentCountDelta(1);
    }

    setDeletingMap((m) => ({ ...m, [commentId]: false }));
  }

  useEffect(() => {
    if (!open) return;
    loadComments();
    setTimeout(() => inputRef.current?.focus(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId]);

  if (!open) return null;

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
      <div className="relative w-[94%] max-w-lg bg-white rounded-2xl shadow-xl border overflow-hidden font-serif">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-lg">Comments</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading…</div>
          ) : comments.length > 0 ? (
            <div className="divide-y">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border shrink-0">
                    <img
                      src={
                        c.userId?.avatar
                          ? `/api/image?path=${encodeURIComponent(
                              `/uploads/profile-image/${c.userId.avatar}`,
                            )}`
                          : "/images/default-avatar.png"
                      }
                      className="w-full h-full object-cover"
                      alt="avatar"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-avatar.png";
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-black">
                        @{c.userId?.username || "unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {timeAgo(c.createdAt)}
                      </p>
                    </div>

                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {c.commentText}
                    </p>
                  </div>

                  {/* delete */}
                  <button
                    type="button"
                    onClick={() => deleteComment(c._id)}
                    disabled={!!deletingMap[c._id] || c._id.startsWith("temp-")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition ${
                      deletingMap[c._id] ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 italic">
              No comments yet
            </div>
          )}
        </div>

        {/* composer */}
        <div className="border-t px-4 py-3 flex gap-2 items-center">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 px-4 py-2 rounded-full border outline-none focus:ring-2 focus:ring-[#C974A6]/30"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                createComment();
              }
            }}
          />
          <button
            type="button"
            onClick={createComment}
            disabled={posting || text.trim().length === 0}
            className={`px-4 py-2 rounded-full font-bold transition ${
              posting || text.trim().length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#C974A6] text-white hover:opacity-90"
            }`}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
