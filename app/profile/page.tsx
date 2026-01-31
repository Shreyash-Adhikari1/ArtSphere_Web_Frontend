"use client";

import { useEffect, useState } from "react";
import { Settings, Grid, Heart, Bookmark } from "lucide-react";
import Sidebar from "../(public)/_components/Sidebar";

type User = {
  username: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  postCount: number;
  followingCount: number;
  followerCount: number;
  posts: { _id: string; image: string }[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || data.data || data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-12 py-8 max-w-6xl">
        {/* Top bar */}
        <div className="flex justify-end mb-6">
          <Settings className="text-pink-500 cursor-pointer" size={24} />
        </div>

        {/* Profile header */}
        <section className="flex items-center gap-12 mb-10">
          {/* Avatar */}
          <div className="w-36 h-36 rounded-full overflow-hidden border bg-gray-100">
            <img
              src={
                user.avatar
                  ? `/api/image?path=/uploads/profile-image/${user.avatar}`
                  : "/default-avatar.jpg"
              }
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>

          {/* User info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-pink-600">
              @{user.username}
            </h2>

            <div className="flex gap-10 text-center">
              <Stat label="posts" value={user.postCount} />
              <Stat label="following" value={user.followingCount} />
              <Stat label="followers" value={user.followerCount} />
            </div>

            {user.bio && (
              <p className="max-w-md text-gray-600 italic">“{user.bio}”</p>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="border-t flex justify-center gap-20 mb-8">
          <Tab active icon={<Grid size={22} />} />
          <Tab icon={<Heart size={22} />} />
          <Tab icon={<Bookmark size={22} />} />
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-3 gap-4">
          {user.posts?.length > 0 ? (
            user.posts.map((post) => (
              <div
                key={post._id}
                className="aspect-square bg-gray-100 overflow-hidden group"
              >
                <img
                  src={`/api/image?path=/uploads/post-images/${post.image}`}
                  alt="post"
                  className="w-full h-full object-cover group-hover:scale-110 transition"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20 text-gray-400">
              No posts yet
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Small components ---------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-bold text-black">{value}</p>
      <p className="text-sm text-gray-400 lowercase">{label}</p>
    </div>
  );
}

function Tab({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={`py-4 cursor-pointer border-t-2 ${
        active ? "border-black text-black" : "border-transparent text-gray-400"
      }`}
    >
      {icon}
    </div>
  );
}
