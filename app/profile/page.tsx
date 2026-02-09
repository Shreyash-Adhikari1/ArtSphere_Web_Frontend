"use client";

import { useEffect, useState } from "react";
import { Settings, Grid, Heart, Bookmark } from "lucide-react";
import Sidebar from "../(public)/_components/Sidebar";

/* ---------- Types ---------- */

type User = {
  username: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  postCount: number;
  followingCount: number;
  followerCount: number;
};

type Post = {
  _id: string;
  media?: string;
  mediaType?: "image" | "video";
  isChallengeSubmission?: boolean;
  likeCount?: number;
  commentCount?: number;
};

/* ---------- Helpers ---------- */

function resolvePostPath(post: Post) {
  if (!post.media) return null;

  if (post.isChallengeSubmission) {
    return `/uploads/challenge-submissions/${post.media}`;
  }

  return `/uploads/post-images/${post.media}`;
}

/* ---------- Page ---------- */

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---- Fetch user profile ---- */
  async function loadProfile() {
    try {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load profile");
      }

      setUser(data.user || data.data || data);
    } catch (e: any) {
      setError(e.message || "Failed to load profile");
    }
  }

  /* ---- Fetch my posts ---- */
  async function loadMyPosts() {
    try {
      const res = await fetch("/api/post/posts/my-posts", {
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok && data.posts) {
        setPosts(data.posts);
      }
    } catch {
      // silent fail – profile still renders
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadMyPosts()]);
      setLoading(false);
    })();
  }, []);

  /* ---------- States ---------- */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 font-serif">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">{error || "Not logged in"}</p>
        </div>
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-6 md:px-12 py-8 max-w-6xl mx-auto font-serif">
        {/* Top bar */}
        <div className="flex justify-end mb-6">
          <Settings className="text-[#C974A6] cursor-pointer" size={24} />
        </div>

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
              onError={(e) => {
                e.currentTarget.src = "/images/artsphere_logo.png";
              }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-[#C974A6]">
              @{user.username}
            </h2>

            <div className="flex gap-12">
              <Stat label="posts" value={user.postCount} />
              <Stat label="following" value={user.followingCount} />
              <Stat label="followers" value={user.followerCount} />
            </div>

            {user.bio && (
              <p className="max-w-xl text-gray-600 italic">“{user.bio}”</p>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="border-t border-gray-200 flex justify-center gap-20 mb-6">
          <Tab active icon={<Grid size={22} />} />
          <Tab icon={<Heart size={22} />} />
          <Tab icon={<Bookmark size={22} />} />
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {posts.length > 0 ? (
            posts.map((post) => {
              const path = resolvePostPath(post);

              return (
                <div
                  key={post._id}
                  className="relative aspect-square bg-gray-100 overflow-hidden group"
                >
                  {path ? (
                    <img
                      src={`/api/image?path=${encodeURIComponent(path)}`}
                      alt="post"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/images/artsphere_logo.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No media
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-6 text-white font-bold">
                      {post.likeCount != null && (
                        <div className="flex items-center gap-2">
                          <Heart size={18} fill="white" />
                          <span>{post.likeCount}</span>
                        </div>
                      )}
                      {post.commentCount != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💬</span>
                          <span>{post.commentCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-20 text-gray-400 italic">
              No posts yet
            </div>
          )}
        </div>
      </main>
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
      className={`py-4 border-t-2 -mt-1px cursor-pointer ${
        active ? "border-black text-black" : "border-transparent text-gray-400"
      }`}
    >
      {icon}
    </div>
  );
}
