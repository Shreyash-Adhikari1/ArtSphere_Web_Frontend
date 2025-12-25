import Sidebar from "@/app/(public)/_components/Sidebar";
import Image from "next/image";
import { Heart, Send, Bookmark } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 max-w-4xl mx-auto font-serif">
                {/* Top Navigation */}
                <div className="flex gap-8 border-b border-gray-100 mb-6">
                    <button className="pb-2 border-b-2 border-black font-bold">Discover</button>
                    <button className="pb-2 text-gray-400">Following</button>
                </div>

                <h2 className="text-xl font-bold mb-6">Trending Posts</h2>

                {/* Post Feed */}
                <div className="space-y-8">
                    {[1, 2].map((post) => (
                        <div key={post} className="bg-[#FFF6ED] rounded-3xl p-6 shadow-sm border border-orange-50">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-black">@username321</span>
                                    <span className="text-gray-400 text-xs">Posted - 8h ago</span>
                                </div>
                            </div>

                            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-gray-100 bg-white">
                                <Image
                                    src="/images/img1.png"
                                    alt="Post content"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <p className="text-black font-medium mb-4">Learning :)</p>

                            <div className="flex justify-between items-center">
                                <div className="flex gap-4">
                                    <Heart className="text-[#C974A6] cursor-pointer" fill="#C974A6" size={20} />
                                    <Send className="text-black cursor-pointer -rotate-45" size={20} />
                                </div>
                                <Bookmark className="text-black cursor-pointer" size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}