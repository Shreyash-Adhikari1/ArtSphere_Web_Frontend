"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/(public)/_components/Sidebar";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  Trophy,
  Image as ImageIcon,
  Sparkles,
  X,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";

type Challenge = {
  _id: string;
  challengerId?: { _id: string; username?: string; avatar?: string };
  challengeTitle: string;
  challengeDescription: string;
  challengeMedia?: string;
  submissionCount: number;
  status: "open" | "closed";
  endsAt: string;
  createdAt?: string;
};

function resolveChallengeMedia(base: string, media?: string) {
  if (!media) return null;
  if (media.startsWith("http://") || media.startsWith("https://")) return media;
  if (media.startsWith("/uploads/")) return `${base}${media}`;
  // assuming you store filename only
  return `${base}/uploads/challenge-images/${media}`;
}

function resolveAvatarUrl(base: string, avatar?: string) {
  if (!avatar) return "/images/default-avatar.png";
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  if (avatar.startsWith("/uploads/")) return `${base}${avatar}`;
  return `${base}/uploads/profile-image/${avatar}`;
}

function formatEnds(endsAt: string) {
  const d = new Date(endsAt);
  return d.toLocaleString();
}

function daysLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

export default function ChallengesPage() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const router = useRouter();

  const [tab, setTab] = useState<"discover" | "my">("discover");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);

  const [q, setQ] = useState("");

  // create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [endsAt, setEndsAt] = useState(""); // datetime-local string
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // edit modal
  const [editOpen, setEditOpen] = useState<Challenge | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);

  // delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAll() {
    const res = await fetch("/api/challenge/getall", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Failed to load challenges");
    const list: Challenge[] = data?.challenges ?? [];
    setAllChallenges(list);
  }

  async function loadMine() {
    const res = await fetch("/api/challenge/getmy", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok)
      throw new Error(data?.message || "Failed to load my challenges");
    const list: Challenge[] = data?.challenges ?? [];
    setMyChallenges(list);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        await loadAll();
        // Only load mine when needed; but preloading feels nice
        await loadMine();
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const source = tab === "discover" ? allChallenges : myChallenges;
    const query = q.trim().toLowerCase();
    if (!query) return source;

    return source.filter((c) => {
      const a = (c.challengeTitle || "").toLowerCase();
      const b = (c.challengeDescription || "").toLowerCase();
      const u = (c.challengerId?.username || "").toLowerCase();
      return a.includes(query) || b.includes(query) || u.includes(query);
    });
  }, [tab, allChallenges, myChallenges, q]);

  const openChallenges = useMemo(
    () =>
      list
        .filter((c) => c.status === "open")
        .sort((a, b) => +new Date(a.endsAt) - +new Date(b.endsAt)),
    [list],
  );
  const closedChallenges = useMemo(
    () =>
      list
        .filter((c) => c.status === "closed")
        .sort((a, b) => +new Date(b.endsAt) - +new Date(a.endsAt)),
    [list],
  );

  function resetCreate() {
    setTitle("");
    setDesc("");
    setEndsAt("");
    setMediaFile(null);
  }

  async function createChallenge() {
    if (!title.trim() || !desc.trim() || !endsAt) return;

    setCreateLoading(true);
    try {
      const fd = new FormData();
      fd.append("challengeTitle", title.trim());
      fd.append("challengeDescription", desc.trim());
      // Backend expects Date; sending ISO string works in most setups
      fd.append("endsAt", new Date(endsAt).toISOString());
      if (mediaFile) fd.append("challenge-images", mediaFile);

      const res = await fetch("/api/challenge/create", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to create challenge");
      }

      setCreateOpen(false);
      resetCreate();

      // refresh lists
      await Promise.all([loadAll(), loadMine()]);
    } catch (e: any) {
      alert(e?.message || "Failed to create challenge");
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(ch: Challenge) {
    setEditOpen(ch);
    setEditTitle(ch.challengeTitle || "");
    setEditDesc(ch.challengeDescription || "");
    // convert ISO -> datetime-local
    const d = new Date(ch.endsAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes(),
    )}`;
    setEditEndsAt(local);
    setEditMediaFile(null);
  }

  async function saveEdit() {
    if (!editOpen) return;
    if (!editTitle.trim() || !editDesc.trim() || !editEndsAt) return;

    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append("challengeTitle", editTitle.trim());
      fd.append("challengeDescription", editDesc.trim());
      fd.append("endsAt", new Date(editEndsAt).toISOString());
      if (editMediaFile) fd.append("challenge-images", editMediaFile);

      const res = await fetch(`/api/challenge/edit/${editOpen._id}`, {
        method: "PATCH",
        body: fd,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to edit challenge");
      }

      setEditOpen(null);
      await Promise.all([loadAll(), loadMine()]);
    } catch (e: any) {
      alert(e?.message || "Failed to edit challenge");
    } finally {
      setEditLoading(false);
    }
  }

  async function deleteChallenge(id: string) {
    const ok = confirm("Delete this challenge?");
    if (!ok) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/challenge/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to delete challenge");
      }
      await Promise.all([loadAll(), loadMine()]);
    } catch (e: any) {
      alert(e?.message || "Failed to delete challenge");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-5xl mx-auto font-serif text-gray-400">
          Loading challenges…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-5xl mx-auto font-serif text-red-600">
          {error}
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl mx-auto font-serif">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <Sparkles className="text-[#C974A6]" size={22} />
              Challenges
            </h1>
            <p className="text-gray-500 mt-1">
              Create prompts. Inspire others. Collect submissions.
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="self-start md:self-auto px-5 py-2 rounded-full font-bold bg-[#C974A6] text-white hover:opacity-90 transition flex items-center gap-2"
            type="button"
          >
            <Plus size={18} />
            Create Challenge
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="bg-[#FFF6ED] border border-orange-50 rounded-3xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("discover")}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  tab === "discover"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border"
                }`}
                type="button"
              >
                Discover
              </button>
              <button
                onClick={() => setTab("my")}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  tab === "my"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border"
                }`}
                type="button"
              >
                My Challenges
              </button>
            </div>

            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, description, or creator…"
                className="w-full pl-11 pr-4 py-2 rounded-full border bg-white outline-none focus:ring-2 focus:ring-[#C974A6]/30"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <Section
          title="Open challenges"
          subtitle="Join before the deadline."
          items={openChallenges}
          base={BASE}
          routerPush={(id) => router.push(`/challenges/${id}`)}
          tab={tab}
          onEdit={openEdit}
          onDelete={deleteChallenge}
          deletingId={deletingId}
        />

        <div className="h-10" />

        <Section
          title="Closed challenges"
          subtitle="Explore completed prompts."
          items={closedChallenges}
          base={BASE}
          routerPush={(id) => router.push(`/challenges/${id}`)}
          tab={tab}
          onEdit={openEdit}
          onDelete={deleteChallenge}
          deletingId={deletingId}
        />
      </main>

      {/* Create Modal */}
      {createOpen && (
        <Modal
          title="Create a Challenge"
          onClose={() => {
            setCreateOpen(false);
            resetCreate();
          }}
        >
          <div className="space-y-4">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. "Car photography — composition challenge"'
                className="w-full px-4 py-2 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the rules, what to submit, tips, etc…"
                className="w-full px-4 py-2 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30 min-h-27.5"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Ends at">
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30"
                />
              </Field>

              <Field label="Cover image (optional)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </Field>
            </div>

            <button
              onClick={createChallenge}
              disabled={
                createLoading || !title.trim() || !desc.trim() || !endsAt
              }
              className={`w-full py-3 rounded-full font-bold transition ${
                createLoading || !title.trim() || !desc.trim() || !endsAt
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#C974A6] text-white hover:opacity-90"
              }`}
              type="button"
            >
              {createLoading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin" size={18} />
                  Creating…
                </span>
              ) : (
                "Create Challenge"
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <Modal title="Edit Challenge" onClose={() => setEditOpen(null)}>
          <div className="space-y-4">
            <Field label="Title">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30 min-h-27.5"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Ends at">
                <input
                  type="datetime-local"
                  value={editEndsAt}
                  onChange={(e) => setEditEndsAt(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl border outline-none focus:ring-2 focus:ring-[#C974A6]/30"
                />
              </Field>

              <Field label="New cover image (optional)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditMediaFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm"
                />
              </Field>
            </div>

            <button
              onClick={saveEdit}
              disabled={
                editLoading ||
                !editTitle.trim() ||
                !editDesc.trim() ||
                !editEndsAt
              }
              className={`w-full py-3 rounded-full font-bold transition ${
                editLoading ||
                !editTitle.trim() ||
                !editDesc.trim() ||
                !editEndsAt
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }`}
              type="button"
            >
              {editLoading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin" size={18} />
                  Saving…
                </span>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- UI Components ---------- */

function Section({
  title,
  subtitle,
  items,
  base,
  routerPush,
  tab,
  onEdit,
  onDelete,
  deletingId,
}: {
  title: string;
  subtitle: string;
  items: Challenge[];
  base: string;
  routerPush: (id: string) => void;
  tab: "discover" | "my";
  onEdit: (ch: Challenge) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-black">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-sm text-gray-400">{items.length} items</div>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-400 italic bg-white border rounded-3xl p-8 text-center">
          Nothing here yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((c) => {
            const cover = resolveChallengeMedia(base, c.challengeMedia);
            const avatar = resolveAvatarUrl(base, c.challengerId?.avatar);
            const left = daysLeft(c.endsAt);
            const open = c.status === "open";

            return (
              <div
                key={c._id}
                className="bg-[#FFF6ED] rounded-3xl border border-orange-50 shadow-sm overflow-hidden"
              >
                {/* Cover */}
                <div
                  className="relative h-44 bg-white border-b border-orange-50 cursor-pointer"
                  onClick={() => routerPush(c._id)}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt="challenge cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/artsphere_logo.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={34} />
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        open
                          ? "bg-white/90 text-black"
                          : "bg-black/80 text-white"
                      }`}
                    >
                      {open ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div
                    className="cursor-pointer"
                    onClick={() => routerPush(c._id)}
                  >
                    <h3 className="text-black font-bold text-lg line-clamp-1">
                      {c.challengeTitle}
                    </h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {c.challengeDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt="creator"
                        className="w-9 h-9 rounded-full border border-gray-200 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-avatar.png";
                        }}
                      />
                      <div className="leading-tight">
                        <p className="text-sm font-bold text-black">
                          @{c.challengerId?.username || "creator"}
                        </p>
                        <p className="text-xs text-gray-400 inline-flex items-center gap-1">
                          <Calendar size={14} />
                          ends: {formatEnds(c.endsAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-black inline-flex items-center gap-1 justify-end">
                        <Trophy size={16} className="text-[#C974A6]" />
                        {c.submissionCount ?? 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        {open
                          ? left >= 0
                            ? `${left}d left`
                            : "ending…"
                          : "finished"}
                      </p>
                    </div>
                  </div>

                  {/* IG-ish actions for My tab */}
                  {tab === "my" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="flex-1 px-4 py-2 rounded-full font-bold bg-white border hover:bg-gray-50 transition inline-flex items-center justify-center gap-2"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c._id)}
                        disabled={deletingId === c._id}
                        className={`flex-1 px-4 py-2 rounded-full font-bold transition inline-flex items-center justify-center gap-2 ${
                          deletingId === c._id
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:opacity-90"
                        }`}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
        type="button"
      />
      <div className="relative w-[94%] max-w-xl bg-white rounded-3xl shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-lg text-black">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-black mb-2">{label}</p>
      {children}
    </div>
  );
}
