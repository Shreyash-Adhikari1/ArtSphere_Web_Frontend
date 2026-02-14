"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, Grid, Heart, Bookmark, Pencil, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "../(public)/_components/Sidebar";
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

type Post = GridPost & {
  mediaType?: "image" | "video";
};

/* ---------- Page ---------- */

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePost, setActivePost] = useState<Post | null>(null);

  const [listOpen, setListOpen] = useState<null | "followers" | "following">(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // settings dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  /* ---- Fetch user profile ---- */
  async function loadProfile() {
    try {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load profile");
      }

      const u = data.user || data.data || data;
      setUser(u);
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
      // silent fail
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadMyPosts()]);
      setLoading(false);
    })();
  }, []);

  // close dropdown on outside click + ESC
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!menuOpen) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!menuOpen) return;
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Settings"
            >
              <Settings className="text-[#C974A6]" size={24} />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border shadow-lg rounded-2xl overflow-hidden z-20">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile/edit");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition"
                >
                  <Pencil size={16} className="text-[#C974A6]" />
                  <span className="font-semibold text-black">Edit profile</span>
                </button>

                {/* Optional: add logout later if you have an endpoint */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: hook to your logout flow if you have one
                    console.log("logout later");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 transition"
                >
                  <LogOut size={16} className="text-gray-600" />
                  <span className="font-semibold text-black">Logout</span>
                </button>
              </div>
            )}
          </div>
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
                  : "/images/default-avatar.jpg"
              }
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/default-avatar.jpg";
              }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-[#C974A6]">
              @{user.username}
            </h2>

            <div className="flex gap-12 text-black">
              <Stat label="posts" value={user.postCount} />

              <button
                type="button"
                onClick={() => setListOpen("following")}
                className="text-left hover:opacity-80 transition"
              >
                <Stat label="following" value={user.followingCount} />
              </button>

              <button
                type="button"
                onClick={() => setListOpen("followers")}
                className="text-left hover:opacity-80 transition"
              >
                <Stat label="followers" value={user.followerCount} />
              </button>
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
        <PostGrid
          posts={posts}
          showHoverOverlay
          onPostClick={(p) => setActivePost(p as Post)}
        />
      </main>

      {/* Followers/Following modal */}
      <FollowersFollowingModal
        open={listOpen !== null}
        kind={listOpen ?? "followers"}
        userId={user._id}
        onClose={() => setListOpen(null)}
      />

      {/* Post details modal (delete allowed on my profile) */}
      <PostDetailsModal
        open={!!activePost}
        post={activePost}
        canDelete={true}
        onClose={() => setActivePost(null)}
        onDeleted={(postId) => {
          setPosts((prev) => prev.filter((p) => p._id !== postId));
          setUser((prev) =>
            prev
              ? { ...prev, postCount: Math.max(0, prev.postCount - 1) }
              : prev,
          );
        }}
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
      className={`py-4 border-t-2 -mt-1px cursor-pointer ${
        active ? "border-black text-black" : "border-transparent text-gray-400"
      }`}
    >
      {icon}
    </div>
  );
}
