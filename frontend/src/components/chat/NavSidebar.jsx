import { useState } from "react";
import {
  Archive,
  LogOut,
  MessageSquare,
  MoreVertical,
  Plus,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react";
import PulseLogo from "./PulseLogo";
import Avatar from "./Avatar";

const NAV_ITEMS = [
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "groups", label: "Groups", icon: Users },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * Responsive Navigation Sidebar:
 * - Tablet (md): Icon-only compact rail (w-[68px])
 * - Desktop (lg+): Full sidebar with labels (w-[220px])
 * - Mobile: Controlled through mobile drawer or header
 */
export default function NavSidebar({
  user,
  view,
  onViewChange,
  onOpenProfile,
  onLogout,
  chatCount = 0,
  className = "",
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Navigation Menu"
      className={`flex shrink-0 flex-col border-r border-white/6 bg-[#120A24] py-5 select-none transition-all duration-200 md:w-17 md:items-center md:px-2 lg:w-55 lg:items-stretch lg:px-4 ${className}`}
    >
      {/* Brand Header */}
      <a
        href="/"
        className="flex items-center gap-2.5 md:justify-center lg:justify-start lg:px-2"
        title="PulseChat Home"
      >
        <PulseLogo size={36} />
        <span className="hidden text-xl font-extrabold tracking-tight text-white lg:inline">
          PulseChat
        </span>
      </a>

      {/* "+ New Chat" Button */}
      <div className="mt-6 flex justify-center lg:px-1">
        <button
          type="button"
          onClick={() => onViewChange("contacts")}
          title="New Chat"
          className="flex items-center justify-center rounded-2xl bg-linear-to-r from-[#6D5AE6] to-[#8A76FF] text-white shadow-lg shadow-[#6D5AE6]/30 transition-all hover:opacity-95 active:scale-[0.98] md:h-11 md:w-11 md:p-0 lg:h-auto lg:w-full lg:gap-2 lg:py-3 lg:px-4"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden text-sm font-bold lg:inline">New Chat</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="mt-6 flex-1 space-y-1.5 md:w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          const isAvailable =
            item.id === "chats" ||
            item.id === "contacts" ||
            item.id === "settings";

          return (
            <button
              key={item.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (!isAvailable) return;
                if (item.id === "settings") {
                  onOpenProfile?.();
                } else {
                  onViewChange(item.id);
                }
              }}
              title={item.label}
              className={`flex w-full items-center rounded-xl text-sm font-semibold transition-all md:h-10 md:justify-center md:px-0 lg:h-auto lg:justify-between lg:px-3.5 lg:py-2.5 ${
                isActive
                  ? "bg-[#6D5AE6] text-white shadow-md shadow-[#6D5AE6]/20"
                  : isAvailable
                    ? "text-[#9C93B8] hover:bg-white/5 hover:text-white cursor-pointer"
                    : "cursor-not-allowed text-[#9C93B8]/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </div>

              {/* Chat badge count */}
              {item.id === "chats" && chatCount > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                    isActive
                      ? "bg-white text-[#6D5AE6]"
                      : "bg-[#271C48] text-[#9C93B8]"
                  } hidden lg:flex`}
                >
                  {chatCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User Card (Professional, email removed, modern glowing online status) */}
      <div className="relative mt-auto border-t border-white/6 pt-4 md:w-full">
        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close user menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              role="menu"
              className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-60 rounded-2xl border border-white/10 bg-[#1D1336]/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 md:left-2 lg:left-0 lg:w-full"
            >
              {/* Popover Header */}
              <div className="flex items-center gap-3 border-b border-white/6 px-3 py-2.5">
                <Avatar
                  name={user?.name}
                  src={user?.profilePic}
                  size="sm"
                  isOnline={true}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">
                    {user?.name || "Account"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Active Now</span>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenProfile?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#9C93B8] transition-colors hover:bg-white/6 hover:text-white cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  Edit Profile Photo
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main interactive bottom card */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={user?.name || "Account"}
          aria-expanded={isMenuOpen}
          className="group flex w-full items-center rounded-2xl border border-white/6 bg-linear-to-r from-white/4 to-white/2 p-2 text-left transition-all duration-200 hover:border-[#6D5AE6]/40 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] md:justify-center md:p-2 lg:justify-between lg:p-2.5 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              name={user?.name}
              src={user?.profilePic}
              size="sm"
              isOnline={true}
              className="ring-2 ring-[#6D5AE6]/20 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate text-xs font-extrabold text-white tracking-tight group-hover:text-purple-200 transition-colors">
                {user?.name || "Account"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center text-[#8F84B3] group-hover:text-white transition-colors">
            <MoreVertical className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>
    </nav>
  );
}
