import { Home, PlusSquare, Puzzle, User, Bell, LogOut } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    const menuItems = [
        { icon: <Home size={24} />, label: "Home", active: true },
        { icon: <PlusSquare size={24} />, label: "Create" },
        { icon: <Puzzle size={24} />, label: "Challenges" },
        { icon: <User size={24} />, label: "Profile" },
        { icon: <Bell size={24} />, label: "Notifications" },
    ];

    return (
        <div className="w-64 h-screen sticky top-0 border-r border-gray-100 flex flex-col p-6 bg-white font-serif">
            <h1 className="text-[#C974A6] text-3xl font-bold mb-12 px-2">ArtSphere</h1>

            <nav className="flex-1 space-y-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href="#"
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${item.active
                                ? "bg-[#C974A6] text-white shadow-md"
                                : "text-black hover:bg-gray-50"
                            }`}
                    >
                        {item.icon}
                        <span className="text-lg font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <button className="flex items-center gap-4 px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition">
                <LogOut size={24} />
            </button>
        </div>
    );
}