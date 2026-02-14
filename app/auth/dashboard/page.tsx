"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/(public)/_components/Sidebar";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import CommentsModal from "@/app/(public)/_components/CommentsModal";

type Post = {
  _id: string;
  author?: { _id?: string; username?: string; avatar?: string };
  media?: string;
  mediaType?: string;
  caption?: string;
  likeCount?: number;
  commentCount?: number;
  isChallengeSubmission?: boolean;
  createdAt?: string;
};

function resolveMediaUrl(
  base: string,
  post: { media?: string; isChallengeSubmission?: boolean },
) {
  const media = post.media;

  if (!media) return "/images/artsphere_logo.png";
  if (media.startsWith("http://") || media.startsWith("https://")) return media;
  if (media.startsWith("/uploads/")) return `${base}${media}`;

  if (post.isChallengeSubmission) {
    return `${base}/uploads/challenge-submissions/${media}`;
  }
  if (media.startsWith("challenge-submissions-")) {
    return `${base}/uploads/challenge-submissions/${media}`;
  }
  return `${base}/uploads/post-images/${media}`;
}

function resolveAvatarUrl(base: string, avatar?: string) {
  if (!avatar) return "/images/default-avatar.jpg";

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  if (avatar.startsWith("/uploads/")) {
    return `${base}${avatar}`;
  }

  return `${base}/uploads/profile-image/${avatar}`;
}

export default function HomePage() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // likes
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [pendingLike, setPendingLike] = useState<Record<string, boolean>>({});

  // comments modal
  const [activePostId, setActivePostId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/post/posts", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load feed");
        }

        const list: Post[] = data.posts ?? data.data ?? [];
        setPosts(list);

        const initial: Record<string, boolean> = {};
        for (const p of list) {
          const liked = (p as any).likedByMe ?? (p as any).isLiked ?? false;
          initial[p._id] = !!liked;
        }
        setLikedMap(initial);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  async function toggleLike(postId: string) {
    if (pendingLike[postId]) return;

    const currentlyLiked = !!likedMap[postId];

    setLikedMap((m) => ({ ...m, [postId]: !currentlyLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likeCount: Math.max(
                0,
                (p.likeCount ?? 0) + (currentlyLiked ? -1 : 1),
              ),
            }
          : p,
      ),
    );

    setPendingLike((m) => ({ ...m, [postId]: true }));

    try {
      const endpoint = currentlyLiked
        ? `/api/post/unlike/${postId}`
        : `/api/post/like/${postId}`;

      const res = await fetch(endpoint, { method: "POST" });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || `Failed (${res.status})`);
      }
    } catch (e: any) {
      setLikedMap((m) => ({ ...m, [postId]: currentlyLiked }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likeCount: Math.max(
                  0,
                  (p.likeCount ?? 0) + (currentlyLiked ? 1 : -1),
                ),
              }
            : p,
        ),
      );

      console.error("Like toggle failed:", e?.message || e);
    } finally {
      setPendingLike((m) => ({ ...m, [postId]: false }));
    }
  }

  // called by CommentsModal on create/delete
  function applyCommentDelta(postId: string, delta: number) {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              commentCount: Math.max(0, (p.commentCount ?? 0) + delta),
            }
          : p,
      ),
    );
  }

  if (loading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto font-serif">
          Loading feed…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto font-serif text-red-600">
          {error}
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-4xl mx-auto font-serif">
        <div className="flex gap-8 border-b border-gray-100 mb-6">
          <button className="pb-2 border-b-2 border-black font-bold">
            Discover
          </button>
          <button className="pb-2 text-gray-400">Following</button>
        </div>

        <h2 className="text-xl font-bold mb-6 text-black">Trending Posts</h2>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-gray-400 italic">No posts yet.</div>
          ) : (
            posts.map((post) => {
              const username = post.author?.username ?? "artist";
              const mediaUrl = resolveMediaUrl(BASE, post);
              const avatarUrl = resolveAvatarUrl(BASE, post.author?.avatar);
              const liked = !!likedMap[post._id];
              const disabled = !!pendingLike[post._id];

              return (
                <div
                  key={post._id}
                  className="bg-[#FFF6ED] rounded-3xl p-6 shadow-sm border border-orange-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        if (post.author?._id)
                          router.push(`/user/${post.author._id}`);
                      }}
                    >
                      <img
                        src={avatarUrl}
                        alt={`${username} avatar`}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-avatar.png";
                        }}
                      />

                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-black hover:underline">
                          @{username}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden mb-4 border border-gray-100 bg-white">
                    <img
                      src={mediaUrl}
                      alt="Post content"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/images/artsphere_logo.png";
                      }}
                    />
                  </div>

                  {post.caption && (
                    <p className="text-black font-medium mb-4">
                      {post.caption}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        onClick={() => toggleLike(post._id)}
                        disabled={disabled}
                        className={`flex items-center gap-2 ${
                          disabled ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        aria-label={liked ? "Unlike" : "Like"}
                      >
                        <Heart
                          size={20}
                          className={liked ? "text-[#C974A6]" : "text-black"}
                          fill={liked ? "#C974A6" : "none"}
                        />
                        <span className="text-sm font-bold text-black">
                          {post.likeCount ?? 0}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-2"
                        aria-label="Comments"
                        onClick={() => setActivePostId(post._id)}
                      >
                        <MessageCircle size={20} className="text-black" />
                        <span className="text-sm font-bold text-black">
                          {post.commentCount ?? 0}
                        </span>
                      </button>
                    </div>

                    <Bookmark className="text-black cursor-pointer" size={20} />
                  </div>

                  {/* Comments Modal */}
                  {activePostId === post._id && (
                    <CommentsModal
                      postId={post._id}
                      open={true}
                      onClose={() => setActivePostId(null)}
                      onCommentCountDelta={(delta) =>
                        applyCommentDelta(post._id, delta)
                      }
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
