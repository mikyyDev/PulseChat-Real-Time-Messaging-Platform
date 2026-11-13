import { useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { getUserId } from "../lib/chat-utils";
import NavSidebar from "../components/chat/NavSidebar";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import ProfileModal from "../components/chat/ProfileModal";

function EmptyConversation({ onStartChat }) {
  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center bg-[#1A1132] px-6 text-center select-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,90,230,0.1),transparent_70%)]"
      />
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#22173F] text-[#8F84B3] shadow-inner shadow-black/30 ring-1 ring-white/6">
          <MessageSquarePlus className="h-8 w-8 text-[#7B61FF]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Your messages</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#8F84B3]">
            Select a conversation on the left, or click New Chat to start
            talking.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartChat}
          className="mt-2 flex items-center gap-2 rounded-xl bg-linear-to-r from-[#6D5AE6] to-[#8A76FF] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D5AE6]/25 transition-all hover:opacity-95 active:scale-95"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>New Conversation</span>
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const authUser = useAuthStore((state) => state.authUser);
  const logout = useAuthStore((state) => state.logout);

  const chats = useChatStore((state) => state.chats);
  const contacts = useChatStore((state) => state.contacts);
  const messages = useChatStore((state) => state.messages);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const isLoadingChats = useChatStore((state) => state.isLoadingChats);
  const isLoadingContacts = useChatStore((state) => state.isLoadingContacts);
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const isSendingMessage = useChatStore((state) => state.isSendingMessage);
  const fetchChats = useChatStore((state) => state.fetchChats);
  const fetchContacts = useChatStore((state) => state.fetchContacts);
  const selectChat = useChatStore((state) => state.selectChat);
  const closeChat = useChatStore((state) => state.closeChat);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const resetChatStore = useChatStore((state) => state.resetChatStore);

  const [view, setView] = useState("chats");
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchChats();
    fetchContacts();
  }, [fetchChats, fetchContacts]);

  const handleSelectChat = (person) => {
    selectChat(person);
    setIsThreadOpen(true);
  };

  const handleBack = () => {
    setIsThreadOpen(false);
    closeChat();
  };

  const handleLogout = async () => {
    resetChatStore();
    await logout();
  };

  const currentUserId = getUserId(authUser);
  const selectedUserId = getUserId(selectedUser);
  const showListOnMobile = !(selectedUser && isThreadOpen);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#100821] font-sans text-white">
      {/* 1. Left Nav Sidebar (Compact on tablet md, full on desktop lg) */}
      <NavSidebar
        user={authUser}
        view={view}
        onViewChange={setView}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        chatCount={chats.length}
        className="hidden md:flex"
      />

      {/* 2. Middle Panel: Recent Chats */}
      <div
        className={`w-full flex-col md:flex md:w-70 md:shrink-0 lg:w-75 xl:w-80 ${
          showListOnMobile ? "flex" : "hidden"
        }`}
      >
        <ChatList
          view={view}
          onViewChange={setView}
          chats={chats}
          contacts={contacts}
          currentUserId={currentUserId}
          selectedUserId={selectedUserId}
          isLoadingChats={isLoadingChats}
          isLoadingContacts={isLoadingContacts}
          onSelectChat={handleSelectChat}
          onLogout={handleLogout}
          user={authUser}
        />
      </div>

      {/* 3. Main Chat Conversation Pane (Takes full remaining width) */}
      <main
        className={`min-w-0 flex-1 flex-col md:flex ${
          showListOnMobile ? "hidden" : "flex"
        }`}
      >
        {selectedUser ? (
          <ChatWindow
            key={selectedUserId}
            user={selectedUser}
            currentUserId={currentUserId}
            messages={messages}
            isLoading={isLoadingMessages}
            isSending={isSendingMessage}
            onSend={sendMessage}
            onBack={handleBack}
          />
        ) : (
          <EmptyConversation onStartChat={() => setView("contacts")} />
        )}
      </main>

      {/* Profile & Avatar Upload Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
