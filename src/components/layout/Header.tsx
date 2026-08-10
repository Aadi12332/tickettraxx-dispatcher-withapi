import { Search, Menu, LogOut, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Bell from "../../assets/icons/NotificationBell.svg";
import NotificationDrawer from "./NotificationDrawer";
import { useAuth, getInitials } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/NotificationContext";
import Chatbot from "./Chatbot";

interface HeaderProps {
  setIsMobileOpen?: (open: boolean) => void;
}

const Header = ({ setIsMobileOpen }: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unread } = useNotification();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName = user?.name || "Guest";
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";
  const initials = getInitials(user?.name);

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    void logout();
  };

  return (
    <div className="bg-white border border-(--border-gray-2) rounded-[40px] lg:rounded-full min-h-[60px] lg:h-[60px] px-4 lg:px-6 py-2 flex items-center justify-between w-full">
      {/* Left side: Search & Settings */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Hamburger Menu for Mobile */}
        <button
          className="lg:hidden p-2 -ml-2 text-black hover:text-gray-800 transition-colors cursor-pointer"
          onClick={() => setIsMobileOpen?.(true)}
        >
          <Menu size={24} />
        </button>

        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-[200px] lg:w-[280px] h-[36px] bg-[#F2F2F2] rounded-[5px] border border-(--border-light-blue) pl-11 pr-4 text-sm focus:outline-none transition-colors placeholder:text-[#9CA3AF] font-normal"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-3 lg:gap-5">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-black hover:text-gray-800 transition-colors cursor-pointer sm:-ml-2"
          >
            <img src={Bell} alt="Bell" className="size-8 lg:size-10" />

            {unread > 0 && (
              <span className="absolute top-0 left-5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        </div>

          <div className="relative">
            <button
              onClick={() => setShowChat((s) => !s)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <MessageCircle size={20} />
            </button>
            <span className="bg-red-500 absolute top-0 right-1 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px]">
              5
            </span>
          </div>
          {showChat && (
            <Chatbot open={showChat} onClose={() => setShowChat(false)} />
          )}

        <NotificationDrawer
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
        />

        {/* User Profile */}
        <div
          className="relative flex items-center gap-2 lg:gap-3 cursor-pointer"
          ref={dropdownRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-[#1D3461]">
              {displayName}
            </span>
            <span className="text-xs text-text-gray">{displayRole}</span>
          </div>
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="h-8 w-8 lg:h-10 lg:w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-sky-blue flex items-center justify-center text-white text-xs lg:text-sm font-semibold">
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 lg:h-3 lg:w-3 rounded-full bg-green border-2 border-white"></span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
