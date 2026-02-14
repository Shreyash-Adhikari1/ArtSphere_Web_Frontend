"use client";

import { Home, PlusSquare, Puzzle, User, Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { icon: <Home size={24} />, label: "Home", href: "/auth/dashboard" },
    {
      icon: <PlusSquare size={24} />,
      label: "Create",
      href: "/post/create-post",
    },
    { icon: <Puzzle size={24} />, label: "Challenges", href: "/challenges" },
    { icon: <User size={24} />, label: "Profile", href: "/profile" },
    {
      icon: <Bell size={24} />,
      label: "Notifications",
      href: "/notifications",
    },
  ];

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });

      // Hard navigation + refresh so middleware and server components re-evaluate auth
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="w-64 h-screen sticky top-0 border-r border-gray-100 flex flex-col p-6 bg-white font-serif">
      <h1 className="text-[#C974A6] text-3xl font-bold mb-12 px-2">
        ArtSphere
      </h1>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-[#C974A6] text-white shadow-md"
                  : "text-black hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span className="text-lg font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        disabled={loggingOut}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${
          loggingOut
            ? "text-gray-400 cursor-not-allowed"
            : "text-black hover:bg-gray-50"
        }`}
      >
        <LogOut size={24} />
        <span className="text-lg font-medium">
          {loggingOut ? "Logging out…" : "Logout"}
        </span>
      </button>
    </div>
  );
}
