"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Grid, Heart, Bookmark } from "lucide-react";
import Sidebar from "../../(public)/_components/Sidebar";
import FollowersFollowingModal from "@/app/(auth)/_components/FollowersFollowingModal";
import PostGrid, { type GridPost } from "@/app/(auth)/_components/PostGrid";
import PostDetailsModal from "@/app/(auth)/_components/PostDetailsModal";

/* ---------- Types ---------- */

type User = {
  _id: string;
  username: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  postCount: number;
  followingCount: number;
  followerCount: number;
};

type Post = GridPost;

/* ---------- Page ---------- */

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const safeUserId = useMemo(() => String(userId || ""), [userId]);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // shared modal state
  const [listOpen, setListOpen] = useState<null | "followers" | "following">(
    null,
  );

  // post modal
  const [activePost, setActivePost] = useState<Post | null>(null);

  // Prevent double submit / race clicks
  const followReqInFlight = useRef(false);

  /* ---- Fetch profile ---- */
  async function loadProfile() {
    const res = await fetch(`/api/user/${safeUserId}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setUser(data.user || data.data || data);
  }

  /* ---- Fetch posts ---- */
  async function loadPosts() {
    const res = await fetch(`/api/post/posts/user/${safeUserId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data.posts) setPosts(data.posts);
  }

  /* ---- Follow status ---- */
  async function loadFollowStatus() {
    const res = await fetch(`/api/follow/is-following/${safeUserId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      setIsFollowing(false);
      return;
    }

    const data = await res.json();
    setIsFollowing(!!data.isFollowing);
  }

  /* ---- Toggle follow/unfollow ---- */
  async function toggleFollow() {
    if (!user) return;
    if (followReqInFlight.current) return;

    followReqInFlight.current = true;
    setFollowLoading(true);

    const wasFollowing = isFollowing;

    // Optimistic UI
    setIsFollowing(!wasFollowing);
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        followerCount: Math.max(
          0,
          prev.followerCount + (wasFollowing ? -1 : 1),
        ),
      };
    });

    const endpoint = wasFollowing
      ? `/api/follow/unfollow/${safeUserId}`
      : `/api/follow/follow/${safeUserId}`;

    const res = await fetch(endpoint, { method: "POST" });

    if (!res.ok) {
      // rollback if failed
      setIsFollowing(wasFollowing);
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          followerCount: Math.max(
            0,
            prev.followerCount + (wasFollowing ? 1 : -1),
          ),
        };
      });
    } else {
      // Sync real truth
      await Promise.all([loadProfile(), loadFollowStatus()]);
    }

    setFollowLoading(false);
    followReqInFlight.current = false;
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadPosts(), loadFollowStatus()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeUserId]);

  /* ---------- States ---------- */

  if (loading || !user) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading profile…
        </div>
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-6 md:px-12 py-8 max-w-6xl mx-auto font-serif">
        {/* Profile header */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12">
          {/* Avatar */}
          <div className="w-36 h-36 rounded-full overflow-hidden border bg-gray-100">
            <img
              src={
                user.avatar
                  ? `/api/image?path=${encodeURIComponent(
                      `/uploads/profile-image/${user.avatar}`,
                    )}`
                  : "/images/artsphere_logo.png"
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-[#C974A6]">
              @{user.username}
            </h2>

            {/* Stats */}
            <div className="flex gap-12 text-black">
              <Stat label="posts" value={user.postCount} />

              <button
                onClick={() => setListOpen("following")}
                className="text-left hover:opacity-80 transition"
                type="button"
              >
                <Stat label="following" value={user.followingCount} />
              </button>

              <button
                onClick={() => setListOpen("followers")}
                className="text-left hover:opacity-80 transition"
                type="button"
              >
                <Stat label="followers" value={user.followerCount} />
              </button>
            </div>

            {user.bio && (
              <p className="max-w-xl text-gray-600 italic">“{user.bio}”</p>
            )}

            {/* Follow button */}
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`mt-2 px-6 py-2 rounded-full font-bold transition ${
                isFollowing
                  ? "bg-gray-200 text-black hover:bg-gray-300"
                  : "bg-[#C974A6] text-white hover:opacity-90"
              } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {followLoading
                ? "Please wait…"
                : isFollowing
                  ? "Following"
                  : "Follow"}
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-t border-gray-200 flex justify-center gap-20 mb-6">
          <Tab active icon={<Grid size={22} />} />
          <Tab icon={<Heart size={22} />} />
          <Tab icon={<Bookmark size={22} />} />
        </div>

        {/* Posts grid */}
        <PostGrid
          posts={posts}
          showHoverOverlay={false}
          onPostClick={(p) => setActivePost(p as Post)}
        />
      </main>

      {/* Shared Followers/Following Modal */}
      <FollowersFollowingModal
        open={listOpen !== null}
        kind={listOpen ?? "followers"}
        userId={safeUserId}
        onClose={() => setListOpen(null)}
      />

      {/* Post details modal (no delete here) */}
      <PostDetailsModal
        open={!!activePost}
        post={activePost}
        canDelete={false}
        onClose={() => setActivePost(null)}
        onDeleted={() => {}}
        onPostUpdated={(updated) => {
          setPosts((prev) =>
            prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)),
          );
          setActivePost((prev) =>
            prev && prev._id === updated._id
              ? ({ ...prev, ...updated } as any)
              : prev,
          );
        }}
      />
    </div>
  );
}

/* ---------- Small Components ---------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-400 lowercase">{label}</p>
    </div>
  );
}

function Tab({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={`py-4 border-t-2 cursor-pointer ${
        active ? "border-black text-black" : "border-transparent text-gray-400"
      }`}
    >
      {icon}
    </div>
  );
}
