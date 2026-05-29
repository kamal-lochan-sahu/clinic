import { Bell, Search, Menu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

export default function Navbar({ title }) {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-gray-900 text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} className="text-gray-600" />
        </button>
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
