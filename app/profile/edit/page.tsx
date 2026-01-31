"use client";

import Sidebar from "@/app/(public)/_components/Sidebar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CheckCircle2, XCircle } from "lucide-react";

type User = {
  fullName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
};

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [me, setMe] = useState<User | null>(null);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadMe() {
    setError("");
    setOkMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        setMe(null);
        setError(data?.message || "Not logged in");
        return;
      }

      const user = (data.user ?? data.data ?? data) as User;
      setMe(user);

      setFullName(user.fullName ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  const avatarSrc = useMemo(() => {
    // show selected image preview instantly
    if (avatarFile) return URL.createObjectURL(avatarFile);

    // otherwise show current avatar from server
    if (me?.avatar) {
      return `/api/image?path=${encodeURIComponent(
        `/uploads/profile-image/${me.avatar}`,
      )}`;
    }

    return "/default-avatar.jpg";
  }, [avatarFile, me?.avatar]);

  useEffect(() => {
    // cleanup objectURL
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  async function save() {
    setSaving(true);
    setError("");
    setOkMsg("");

    try {
      const hasImage = !!avatarFile;

      let res: Response;

      if (hasImage) {
        const fd = new FormData();
        fd.append("profile-image", avatarFile!);
        fd.append("fullName", fullName);
        fd.append("username", username);
        fd.append("bio", bio);

        res = await fetch("/api/user/me", { method: "PATCH", body: fd });
      } else {
        // If your backend PATCH only accepts multipart, tell me and I’ll switch this to FormData always.
        res = await fetch("/api/user/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, username, bio }),
        });
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        setError(data?.message || `Update failed (${res.status})`);
        return;
      }

      setOkMsg("Profile updated successfully.");
      setAvatarFile(null);
      await loadMe();
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 px-12 py-10 max-w-3xl">
          <h2 className="text-3xl font-extrabold text-black">Edit Profile</h2>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error || "Not logged in"}
          </div>
        </div>
      </div>
    );
  }

  const isDirty =
    fullName !== (me.fullName ?? "") ||
    username !== (me.username ?? "") ||
    bio !== (me.bio ?? "") ||
    !!avatarFile;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-12 py-8 max-w-5xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Edit Profile</h1>
            <p className="text-gray-500 mt-1">Keep it clean. Keep it you.</p>
          </div>

          <button
            onClick={save}
            disabled={saving || !isDirty}
            className={`rounded-full px-6 py-3 font-bold shadow-sm transition
              ${
                saving || !isDirty
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#C974A6] text-white hover:brightness-95"
              }`}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {/* Status messages */}
        <div className="space-y-3 mb-6">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <XCircle size={18} />
              <span className="font-semibold">{error}</span>
            </div>
          )}
          {okMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
              <CheckCircle2 size={18} />
              <span className="font-semibold">{okMsg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: avatar card */}
          <section className="lg:col-span-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-600 mb-4">
                Profile photo
              </p>

              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-40 h-40 rounded-full overflow-hidden border border-gray-200 bg-gray-100"
                  aria-label="Change profile photo"
                >
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/default-avatar.jpg")
                    }
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 text-white font-bold">
                      <Camera size={18} />
                      Change
                    </div>
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />

                <p className="mt-4 text-xs text-gray-500 text-center">
                  Click the avatar to upload a new photo. <br />
                  Field name: <span className="font-bold">profile-image</span>
                </p>

                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => setAvatarFile(null)}
                    className="mt-4 text-sm font-bold text-[#C974A6] hover:underline"
                  >
                    Remove selected photo
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Right: form card */}
          <section className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-600 mb-5">
                Basic information
              </p>

              <div className="space-y-5">
                <Field label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl bg-[#F3E8EE] px-5 py-4 text-black outline-none focus:ring-2 focus:ring-[#C974A6]"
                    placeholder="Your full name"
                  />
                </Field>

                <Field label="Username">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl bg-[#F3E8EE] px-5 py-4 text-black outline-none focus:ring-2 focus:ring-[#C974A6]"
                    placeholder="@yourname"
                  />
                </Field>

                <Field label="Bio">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl bg-[#F3E8EE] px-5 py-4 text-black outline-none focus:ring-2 focus:ring-[#C974A6] resize-none"
                    placeholder="Tell people what you create…"
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    {bio.length}/160
                  </div>
                </Field>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving || !isDirty}
                    className={`flex-1 rounded-full px-6 py-3 font-bold shadow-sm transition
                      ${
                        saving || !isDirty
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#C974A6] text-white hover:brightness-95"
                      }`}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // reset local edits to current me
                      setFullName(me.fullName ?? "");
                      setUsername(me.username ?? "");
                      setBio(me.bio ?? "");
                      setAvatarFile(null);
                      setError("");
                      setOkMsg("");
                    }}
                    className="rounded-full px-6 py-3 font-bold border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Tip: save will upload your avatar (if selected) + text fields in
              one request.
            </p>
          </section>
        </div>
      </main>
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
    <label className="block">
      <div className="mb-2 text-sm font-bold text-gray-700">{label}</div>
      {children}
    </label>
  );
}
