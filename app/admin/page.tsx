"use client";

import Sidebar from "@/app/(public)/_components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Search,
  Trash2,
  User,
  Image as ImageIcon,
  RefreshCcw,
} from "lucide-react";

type AdminUser = {
  _id: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: "admin" | "user";
  avatar?: string;
  createdAt?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
};

type AdminPost = {
  _id: string;
  media?: string;
  mediaType?: "image" | "video";
  isChallengeSubmission?: boolean;
  likeCount?: number;
  commentCount?: number;
};

const UPLOAD_PROFILE_DIR = "/uploads/profile-image";
const UPLOAD_POST_DIR = "/uploads/post-images";

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "posts">("users");

  // users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState<AdminPost[]>([]);
  const [selectedPostsLoading, setSelectedPostsLoading] = useState(false);

  // posts
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postError, setPostError] = useState("");

  function resolvePostPath(post: AdminPost) {
    if (!post.media) return null;

    if (post.isChallengeSubmission) {
      return `/uploads/challenge-submissions/${post.media}`;
    }

    return `/uploads/post-images/${post.media}`;
  }

  async function fetchUsers() {
    setUsersLoading(true);
    setUserError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const text = await res.text();
      const data = safeJson(text);

      if (!res.ok) {
        setUserError(data?.message || `Failed (${res.status})`);
        setUsers([]);
        return;
      }

      // backend might return { success, users } OR { users } OR array
      const list: AdminUser[] = data?.users ?? data?.data ?? data ?? [];
      setUsers(Array.isArray(list) ? list : []);
      setPage(1);
    } catch (e: any) {
      setUserError(e?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }
  async function updateUser(userId: string, payload: Partial<AdminUser>) {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users/edit/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = safeJson(text);

      if (!res.ok) {
        alert(data?.message || "Update failed");
        return;
      }

      setEditingUser(null);
      await fetchUsers();

      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, ...payload });
      }
    } finally {
      setEditLoading(false);
    }
  }

  async function fetchAllPosts() {
    setPostsLoading(true);
    setPostError("");
    try {
      const res = await fetch("/api/admin/posts", { cache: "no-store" });
      const text = await res.text();
      const data = safeJson(text);

      if (!res.ok) {
        setPostError(data?.message || `Failed (${res.status})`);
        setPosts([]);
        return;
      }

      const list: AdminPost[] = data?.posts ?? data?.data ?? data ?? [];
      setPosts(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setPostError(e?.message || "Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  }

  async function fetchPostsByUser(userId: string) {
    setSelectedPostsLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/user/${userId}`, {
        cache: "no-store",
      });
      const text = await res.text();
      const data = safeJson(text);

      if (!res.ok) {
        setSelectedUserPosts([]);
        return;
      }

      const list: AdminPost[] = data?.posts ?? data?.data ?? data ?? [];
      setSelectedUserPosts(Array.isArray(list) ? list : []);
    } finally {
      setSelectedPostsLoading(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user?")) return;

    const res = await fetch(`/api/admin/users/delete/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const t = await res.text();
      alert(safeJson(t)?.message || `Delete failed (${res.status})`);
      return;
    }

    // refresh
    if (selectedUser?._id === userId) {
      setSelectedUser(null);
      setSelectedUserPosts([]);
    }
    await fetchUsers();
  }

  async function deleteAllUsers() {
    if (!confirm("DELETE ALL USERS? This is irreversible.")) return;

    const res = await fetch(`/api/admin/users/deleteAll`, { method: "DELETE" });
    if (!res.ok) {
      const t = await res.text();
      alert(safeJson(t)?.message || `Delete failed (${res.status})`);
      return;
    }
    setSelectedUser(null);
    setSelectedUserPosts([]);
    await fetchUsers();
  }

  async function deletePost(postId: string) {
    if (!confirm("Delete this post?")) return;

    const res = await fetch(`/api/admin/posts/delete/${postId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const t = await res.text();
      alert(safeJson(t)?.message || `Delete failed (${res.status})`);
      return;
    }

    // refresh both
    await fetchAllPosts();
    if (selectedUser?._id) await fetchPostsByUser(selectedUser._id);
  }

  async function deleteAllPostsByUser(userId: string) {
    if (!confirm("Delete ALL posts by this user?")) return;

    const res = await fetch(`/api/admin/posts/deleteAll/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const t = await res.text();
      alert(safeJson(t)?.message || `Delete failed (${res.status})`);
      return;
    }
    await fetchAllPosts();
    await fetchPostsByUser(userId);
  }

  useEffect(() => {
    // initial load: users
    fetchUsers();
  }, []);

  useEffect(() => {
    if (tab === "posts" && posts.length === 0) fetchAllPosts();
  }, [tab]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
      .filter((u) => {
        if (!q) return true;
        return (
          (u.username || "").toLowerCase().includes(q) ||
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
        );
      });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-10 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8EE] flex items-center justify-center border">
              <Shield className="text-[#C974A6]" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black">
                Admin Panel
              </h1>
              <p className="text-gray-500 text-sm">Manage users and posts</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => (tab === "users" ? fetchUsers() : fetchAllPosts())}
              className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 font-bold flex items-center gap-2"
            >
              <RefreshCcw size={16} /> Refresh
            </button>

            {tab === "users" && (
              <button
                onClick={deleteAllUsers}
                className="px-4 py-2 rounded-full bg-[#C974A6] text-white hover:brightness-95 font-bold flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete all users
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t flex gap-8 mb-6">
          <TabBtn
            active={tab === "users"}
            onClick={() => setTab("users")}
            icon={<User size={18} />}
            label="Users"
          />
          <TabBtn
            active={tab === "posts"}
            onClick={() => setTab("posts")}
            icon={<ImageIcon size={18} />}
            label="Posts"
          />
        </div>

        {tab === "users" ? (
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Users list */}
            <div className="lg:col-span-3 rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-[#F3E8EE] rounded-full px-4 py-2 w-full md:w-90">
                    <Search size={16} className="text-gray-500" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search username, name, email…"
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="rounded-full border border-gray-200 px-3 py-2 text-sm font-bold"
                  >
                    <option value="all">All</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <div className="text-sm text-gray-500 font-bold">
                  Total:{" "}
                  <span className="text-black">{filteredUsers.length}</span>
                </div>
              </div>

              <div className="p-5">
                {usersLoading ? (
                  <p className="text-gray-400">Loading users…</p>
                ) : userError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold">
                    {userError}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagedUsers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => {
                          setSelectedUser(u);
                          fetchPostsByUser(u._id);
                        }}
                        className={`w-full text-left rounded-2xl border p-4 transition flex items-center gap-4
                          ${
                            selectedUser?._id === u._id
                              ? "border-[#C974A6] bg-[#F3E8EE]"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border">
                          <img
                            src={
                              u.avatar
                                ? `/api/image?path=${encodeURIComponent(`${UPLOAD_PROFILE_DIR}/${u.avatar}`)}`
                                : "/default-avatar.jpg"
                            }
                            className="w-full h-full object-cover"
                            alt="avatar"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-black">
                              @{u.username || "unknown"}
                            </span>
                            <span
                              className={`text-xs font-extrabold px-2 py-1 rounded-full ${
                                u.role === "admin"
                                  ? "bg-black text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {u.role || "user"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {u.email || "—"}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-black">
                            {u.postCount ?? 0} posts
                          </div>
                          <div className="text-xs text-gray-400">
                            {u.fullName || ""}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!usersLoading && !userError && (
                <div className="p-5 border-t flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-full border font-bold ${
                      page === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Prev
                  </button>

                  <div className="text-sm font-bold text-gray-600">
                    Page <span className="text-black">{page}</span> /{" "}
                    {totalPages}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-full border font-bold ${
                      page === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* User details */}
            <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="p-5 border-b">
                <h2 className="font-extrabold text-black">User details</h2>
                <p className="text-gray-500 text-sm">Select a user to manage</p>
              </div>

              <div className="p-5">
                {!selectedUser ? (
                  <div className="text-gray-400">No user selected.</div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border">
                        <img
                          src={
                            selectedUser.avatar
                              ? `/api/image?path=${encodeURIComponent(`${UPLOAD_PROFILE_DIR}/${selectedUser.avatar}`)}`
                              : "/default-avatar.jpg"
                          }
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-black">
                          @{selectedUser.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedUser.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {selectedUser.fullName || ""}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <MiniStat
                        label="posts"
                        value={selectedUser.postCount ?? 0}
                      />
                      <MiniStat
                        label="following"
                        value={selectedUser.followingCount ?? 0}
                      />
                      <MiniStat
                        label="followers"
                        value={selectedUser.followerCount ?? 0}
                      />
                    </div>

                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => setEditingUser(selectedUser)}
                        className="flex-1 rounded-full border border-gray-200 font-extrabold px-4 py-3 hover:bg-gray-50"
                      >
                        Edit user
                      </button>
                      <button
                        onClick={() => deleteUser(selectedUser._id)}
                        className="flex-1 rounded-full bg-[#C974A6] text-white font-extrabold px-4 py-3 hover:brightness-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Delete user
                      </button>

                      <button
                        onClick={() => deleteAllPostsByUser(selectedUser._id)}
                        className="flex-1 rounded-full border border-gray-200 font-extrabold px-4 py-3 hover:bg-gray-50"
                      >
                        Delete posts
                      </button>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-extrabold text-black">
                          User posts
                        </h3>
                        <span className="text-xs text-gray-400">
                          {selectedPostsLoading
                            ? "Loading…"
                            : `${selectedUserPosts.length} items`}
                        </span>
                      </div>

                      {selectedPostsLoading ? (
                        <p className="text-gray-400">Loading posts…</p>
                      ) : selectedUserPosts.length === 0 ? (
                        <p className="text-gray-400">No posts found.</p>
                      ) : (
                        <div className="relative">
                          {/* Left arrow */}
                          <button
                            onClick={() => {
                              const el =
                                document.getElementById("user-post-scroll");
                              el?.scrollBy({ left: -300, behavior: "smooth" });
                            }}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1 shadow hover:bg-gray-100"
                          >
                            ◀
                          </button>

                          {/* Right arrow */}
                          <button
                            onClick={() => {
                              const el =
                                document.getElementById("user-post-scroll");
                              el?.scrollBy({ left: 300, behavior: "smooth" });
                            }}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1 shadow hover:bg-gray-100"
                          >
                            ▶
                          </button>

                          {/* Scroll container */}
                          <div
                            id="user-post-scroll"
                            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
                          >
                            {selectedUserPosts.map((p) => {
                              const path = resolvePostPath(p);

                              return (
                                <button
                                  key={p._id}
                                  onClick={() => deletePost(p._id)}
                                  title="Click to delete post"
                                  className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border snap-start group"
                                >
                                  {path ? (
                                    <img
                                      src={`/api/image?path=${encodeURIComponent(path)}`}
                                      alt="post"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/images/artsphere_logo.png";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                      No media
                                    </div>
                                  )}

                                  {/* Delete overlay */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                      Delete
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedUserPosts.length > 9 && (
                        <p className="text-xs text-gray-400 mt-3">
                          Showing 9 of {selectedUserPosts.length}. Use Posts tab
                          to manage everything.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-black">All posts</h2>
                <p className="text-gray-500 text-sm">Admin can delete posts</p>
              </div>
              <div className="text-sm text-gray-500 font-bold">
                Total: <span className="text-black">{posts.length}</span>
              </div>
            </div>

            <div className="p-5">
              {postsLoading ? (
                <p className="text-gray-400">Loading posts…</p>
              ) : postError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold">
                  {postError}
                </div>
              ) : posts.length === 0 ? (
                <p className="text-gray-400">No posts found.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {posts.map((p) => (
                    <div
                      key={p._id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border"
                    >
                      <img
                        src={
                          p.media
                            ? `/api/image?path=${encodeURIComponent(`${UPLOAD_POST_DIR}/${p.media}`)}`
                            : "/default-avatar.jpg"
                        }
                        className="w-full h-full object-cover"
                        alt="post"
                      />
                      <button
                        onClick={() => deletePost(p._id)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center"
                        title="Delete post"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition text-white font-extrabold flex items-center gap-2">
                          <Trash2 size={16} /> Delete
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
              <h3 className="text-xl font-extrabold mb-4">Edit user</h3>

              <div className="space-y-4">
                <input
                  defaultValue={editingUser.username}
                  placeholder="Username"
                  className="w-full rounded-xl border px-4 py-2"
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />

                <input
                  defaultValue={editingUser.fullName}
                  placeholder="Full name"
                  className="w-full rounded-xl border px-4 py-2"
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                />

                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "admin" | "user",
                    })
                  }
                  className="w-full rounded-xl border px-4 py-2 font-bold"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-full border px-4 py-2 font-bold"
                >
                  Cancel
                </button>

                <button
                  disabled={editLoading}
                  onClick={() =>
                    updateUser(editingUser._id, {
                      username: editingUser.username,
                      fullName: editingUser.fullName,
                      role: editingUser.role,
                    })
                  }
                  className="flex-1 rounded-full bg-[#C974A6] text-white px-4 py-2 font-bold disabled:opacity-60"
                >
                  {editLoading ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-4 border-t-2 -mt-px font-extrabold flex items-center gap-2 transition ${
        active
          ? "border-black text-black"
          : "border-transparent text-gray-400 hover:text-black"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
      <div className="text-lg font-extrabold text-black">{value}</div>
      <div className="text-xs text-gray-400 lowercase">{label}</div>
    </div>
  );
}
