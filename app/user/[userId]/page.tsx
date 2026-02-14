"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Grid, Heart, Bookmark, X } from "lucide-react";
import Sidebar from "../../(public)/_components/Sidebar";

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

type Post = {
  _id: string;
  media?: string;
  isChallengeSubmission?: boolean;
  likeCount?: number;
  commentCount?: number;
};

type SimpleUser = {
  _id: string;
  username?: string;
  fullName?: string;
  avatar?: string;
};

/* ---------- Helpers ---------- */

function resolvePostPath(post: Post) {
  if (!post.media) return null;
  if (post.isChallengeSubmission)
    return `/uploads/challenge-submissions/${post.media}`;
  return `/uploads/post-images/${post.media}`;
}

function extractArray(data: any) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const candidates = [
    data.following,
    data.followers,
    data.users,
    data.data,
    data.result,
    data.items,
    data.list,
  ];

  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

function normalizeUsers(list: any[]): SimpleUser[] {
  return list
    .map((item: any) => {
      if (!item) return null;

      // direct user object
      if (item._id && (item.username || item.fullName || item.avatar)) {
        return {
          _id: String(item._id),
          username: item.username,
          fullName: item.fullName,
          avatar: item.avatar,
        };
      }

      // follow doc: follower populated
      if (item.follower && item.follower._id) {
        return {
          _id: String(item.follower._id),
          username: item.follower.username,
          fullName: item.follower.fullName,
          avatar: item.follower.avatar,
        };
      }

      // follow doc: following populated
      if (item.following && item.following._id) {
        return {
          _id: String(item.following._id),
          username: item.following.username,
          fullName: item.following.fullName,
          avatar: item.following.avatar,
        };
      }

      // if only IDs are present
      if (item._id) return { _id: String(item._id) };
      if (item.follower) return { _id: String(item.follower) };
      if (item.following) return { _id: String(item.following) };

      return null;
    })
    .filter(Boolean) as SimpleUser[];
}

/* ---------- Page ---------- */

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const safeUserId = useMemo(() => String(userId || ""), [userId]);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Instagram-ish modal
  const [listOpen, setListOpen] = useState<null | "followers" | "following">(
    null,
  );
  const [listLoading, setListLoading] = useState(false);
  const [listUsers, setListUsers] = useState<SimpleUser[]>([]);

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

  /* ---- Follow status (uses your NEW backend endpoint) ---- */
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

  /* ---- Followers / Following list (for viewed user) ---- */
  async function openList(kind: "followers" | "following") {
    setListOpen(kind);
    setListLoading(true);
    setListUsers([]);

    const endpoint =
      kind === "followers"
        ? `/api/follow/${safeUserId}/followers`
        : `/api/follow/${safeUserId}/following`;

    const res = await fetch(endpoint, { cache: "no-store" });
    const data = await res.json();

    if (res.ok) {
      const raw = extractArray(data);
      setListUsers(normalizeUsers(raw));
    }

    setListLoading(false);
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

    // If followers modal is open, reflect change instantly (Instagram-ish)
    if (listOpen === "followers") {
      if (wasFollowing) {
        // if you unfollow someone, THEY lose you as follower? Actually no — unfollow means YOU stop following THEM.
        // Followers of the viewed user decreases by 1 (you were a follower). So remove "me" if present.
        // We don't know current user id here, so we won't manipulate listUsers blindly.
        // We'll just refetch list after request succeeds.
      }
    }

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

      // If modal is open, refresh it so it matches backend
      if (listOpen) {
        await openList(listOpen);
      }
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
                onClick={() => openList("following")}
                className="text-left hover:opacity-80 transition"
                type="button"
              >
                <Stat label="following" value={user.followingCount} />
              </button>

              <button
                onClick={() => openList("followers")}
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
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {posts.length > 0 ? (
            posts.map((post) => {
              const path = resolvePostPath(post);

              return (
                <div
                  key={post._id}
                  className="relative aspect-square bg-gray-100 overflow-hidden"
                >
                  {path && (
                    <img
                      src={`/api/image?path=${encodeURIComponent(path)}`}
                      className="w-full h-full object-cover"
                      alt="post"
                    />
                  )}
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

      {/* Followers/Following Modal */}
      {listOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setListOpen(null)}
            aria-label="Close"
            type="button"
          />

          {/* modal */}
          <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-lg">
                {listOpen === "followers" ? "Followers" : "Following"}
              </h3>
              <button
                onClick={() => setListOpen(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto">
              {listLoading ? (
                <div className="py-10 text-center text-gray-400">Loading…</div>
              ) : listUsers.length > 0 ? (
                <div className="divide-y">
                  {listUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 px-5 py-4"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
                        <img
                          src={
                            u.avatar
                              ? `/api/image?path=${encodeURIComponent(
                                  `/uploads/profile-image/${u.avatar}`,
                                )}`
                              : "/images/artsphere_logo.png"
                          }
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      </div>

                      <div className="leading-tight">
                        <p className="font-semibold text-sm">
                          {u.username ? `@${u.username}` : "Unknown user"}
                        </p>
                        {u.fullName && (
                          <p className="text-xs text-gray-500">{u.fullName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-400 italic">
                  No {listOpen} yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
