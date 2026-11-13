import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  MessageSquare,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Avatar from "./Avatar";
import PulseLogo from "./PulseLogo";
import {
  formatListTime,
  getMessagePreview,
  getUserId,
} from "../../lib/chat-utils";

function matchesQuery(person, query) {
  if (!query) return true;
  const haystack = `${person.name ?? ""} ${person.email ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function RowSkeleton() {
  return (
    <li className="flex animate-pulse items-center gap-3 rounded-2xl p-3">
      <div className="h-10 w-10 rounded-full bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded-full bg-white/10" />
        <div className="h-2.5 w-2/3 rounded-full bg-white/6" />
      </div>
    </li>
  );
}

function ListState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#9C93B8]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#9C93B8]">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * Responsive "Recent Chats" List Panel:
 * - Mobile: Header with brand, quick New Chat, and contact toggle
 * - Tablet & Desktop: Generous top spacing, title + filter action
 * - Real conversation cards with avatar, unread badge, and active state
 */
export default function ChatList({
  view,
  onViewChange,
  chats,
  contacts,
  currentUserId,
  selectedUserId,
  isLoadingChats,
  isLoadingContacts,
  onSelectChat,
}) {
  const [query, setQuery] = useState("");
  const isContactsView = view === "contacts";
  const isLoading = isContactsView ? isLoadingContacts : isLoadingChats;

  const visibleChats = useMemo(() => {
    return chats.filter((chat) => matchesQuery(chat, query));
  }, [chats, query]);

  const visibleContacts = useMemo(() => {
    return contacts.filter((contact) => matchesQuery(contact, query));
  }, [contacts, query]);

  return (
    <aside
      aria-label="Recent Conversations"
      className="flex h-full w-full flex-col border-r border-white/6 bg-[#160E2A] px-3.5 pb-5 select-none pt-4 md:pt-14"
    >
      {/* Mobile-only Brand Header with User Menu */}
      <div className="flex items-center justify-between pb-3 md:hidden">
        <div className="flex items-center gap-2">
          <PulseLogo size={28} />
          <span className="text-base font-extrabold text-white">PulseChat</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewChange(isContactsView ? "chats" : "contacts")}
            className="flex h-8 items-center gap-1.5 rounded-xl bg-linear-to-r from-[#6D5AE6] to-[#8A76FF] px-2.5 text-xs font-bold text-white shadow-sm"
          >
            {isContactsView ? (
              <>
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chats</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>New</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Panel Header: Title + Filter Icon */}
      <div className="mt-1 flex items-center justify-between px-2 pb-3.5">
        <div className="flex items-center gap-2">
          {isContactsView && (
            <button
              type="button"
              onClick={() => onViewChange("chats")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9C93B8] transition-colors hover:bg-white/6 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-lg font-extrabold tracking-tight text-white">
            {isContactsView ? "Contacts" : "Recent Chats"}
          </h2>
        </div>

        <button
          type="button"
          aria-label="Filter chats"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#22173F] text-[#9C93B8] transition-colors hover:bg-[#2B1E4D] hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-1 pt-1 pb-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8F84B3]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isContactsView ? "Search contacts..." : "Search chats..."
            }
            className="w-full rounded-xl border border-white/4 bg-[#22173F] py-2 pl-9 pr-3 text-xs text-white placeholder-[#8F84B3] outline-none transition-colors focus:border-[#6D5AE6]/60 focus:ring-1 focus:ring-[#6D5AE6]/60"
          />
        </div>
      </div>

      {/* Chat / Contact List */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-1 space-y-1 pb-2">
        {isLoading ? (
          <ul className="space-y-1">
            {[1, 2, 3, 4, 5].map((k) => (
              <RowSkeleton key={k} />
            ))}
          </ul>
        ) : isContactsView ? (
          visibleContacts.length > 0 ? (
            <ul className="space-y-1">
              {visibleContacts.map((contact) => {
                const contactId = getUserId(contact);
                const isSelected = contactId === selectedUserId;

                return (
                  <li key={contactId}>
                    <button
                      type="button"
                      onClick={() => onSelectChat(contact)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all ${
                        isSelected
                          ? "bg-[#271C4B] shadow-md shadow-black/20 ring-1 ring-white/8"
                          : "hover:bg-white/4"
                      }`}
                    >
                      <Avatar
                        name={contact.name}
                        src={contact.profilePic}
                        size="md"
                        isOnline={Boolean(contact.isOnline)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-white">
                          {contact.name}
                        </p>
                        <p className="truncate text-[11px] text-[#9C93B8]">
                          {contact.email}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ListState
              icon={Users}
              title="No contacts found"
              description="Invite colleagues or wait for new registrations."
            />
          )
        ) : visibleChats.length > 0 ? (
          <ul className="space-y-1">
            {visibleChats.map((chat) => {
              const chatId = getUserId(chat);
              const isSelected = chatId === selectedUserId;

              return (
                <li key={chatId}>
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all ${
                      isSelected
                        ? "bg-[#271C4B] shadow-md shadow-black/20 ring-1 ring-white/8"
                        : "hover:bg-white/4"
                    }`}
                  >
                    <Avatar
                      name={chat.name}
                      src={chat.profilePic}
                      size="md"
                      isOnline={Boolean(chat.isOnline)}
                    />

                    <div className="min-w-0 flex-1">
                      {/* Name & Time */}
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="truncate text-xs font-bold text-white">
                          {chat.name}
                        </span>
                        {chat.lastMessage?.createdAt && (
                          <span className="shrink-0 text-[10px] text-[#8F84B3]">
                            {formatListTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Preview Snippet & Unread Badge */}
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] text-[#9C93B8]">
                          {getMessagePreview(chat.lastMessage, currentUserId)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6D5AE6] px-1 text-[9px] font-bold text-white shadow-sm">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ListState
            icon={MessageSquare}
            title="No conversations yet"
            description="Click New Chat to message someone."
          />
        )}
      </div>

      {/* Bottom: "View Archived Chats" */}
      <div className="pt-3 border-t border-white/6 text-center">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-[#8F84B3] transition-colors hover:text-white disabled:opacity-60"
        >
          <Archive className="h-3.5 w-3.5" />
          <span>View Archived Chats</span>
        </button>
      </div>
    </aside>
  );
}
