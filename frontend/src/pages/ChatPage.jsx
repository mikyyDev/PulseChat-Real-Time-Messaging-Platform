import { useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { getUserId } from "../lib/chat-utils";
import { connectSocket, disconnectSocket } from "../lib/socket";
import NavSidebar from "../components/chat/NavSidebar";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import ProfileModal from "../components/chat/ProfileModal";

function EmptyConversation({ onStartChat }) {
  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center bg-[var(--bg-thread)] px-6 text-center select-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,90,230,0.1),transparent_70%)]"
      />
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--bg-elevated)] text-[#6D5AE6] dark:text-[var(--accent-2)] shadow-sm ring-1 ring-[var(--line-strong)]">
          <MessageSquarePlus className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-1)]">Your messages</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-3)]">
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
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);
  const typingUserId = useChatStore((state) => state.typingUserId);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const setTypingUser = useChatStore((state) => state.setTypingUser);
  const receiveMessage = useChatStore((state) => state.receiveMessage);

  const [view, setView] = useState("chats");
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileIntent, setProfileIntent] = useState("view");

  useEffect(() => {
    fetchChats();
    fetchContacts();
  }, [fetchChats, fetchContacts]);

  // Live connection: presence, incoming messages and typing indicators.
  useEffect(() => {
    if (!authUser) return undefined;

    const socket = connectSocket(authUser.token);
    if (!socket) return undefined;

    let hasConnected = false;
    let typingExpiry = null;

    const handleOnlineUsers = (ids) => setOnlineUsers(ids);
    const handleNewMessage = (message) => receiveMessage(message);

    const handleTyping = (payload) => {
      const fromUserId = payload?.fromUserId;
      setTypingUser(fromUserId, true);

      // A sender can drop offline mid-keystroke without emitting stopTyping,
      // so the indicator expires on its own instead of sticking forever.
      if (typingExpiry) clearTimeout(typingExpiry);
      typingExpiry = setTimeout(() => {
        typingExpiry = null;
        setTypingUser(fromUserId, false);
      }, 6000);
    };

    const handleStoppedTyping = (payload) => {
      if (typingExpiry) {
        clearTimeout(typingExpiry);
        typingExpiry = null;
      }
      setTypingUser(payload?.fromUserId, false);
    };

    const handleConnect = () => {
      // First connect is covered by the mount fetches; later ones are
      // reconnects, so anything sent while offline has to be pulled in.
      if (!hasConnected) {
        hasConnected = true;
        return;
      }

      const chatState = useChatStore.getState();
      chatState.fetchChats();
      const openChatId = getUserId(chatState.selectedUser);
      if (openChatId) chatState.fetchMessages(openChatId);
    };

    const handleConnectError = (error) => {
      const message = String(error?.message || "");

      if (message.startsWith("UNAUTHORIZED")) {
        // Retrying a rejected token forever only produces a reconnect loop.
        // Re-check the session: the cookie may still be valid, otherwise the
        // app redirects to the login screen.
        disconnectSocket();
        void useAuthStore.getState().checkAuth();
      }
    };

    socket.on("getOnlineUsers", handleOnlineUsers);
    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStoppedTyping);
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      if (typingExpiry) clearTimeout(typingExpiry);

      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStoppedTyping);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [authUser, setOnlineUsers, receiveMessage, setTypingUser]);

  // Never leave a socket open once this screen is gone.
  useEffect(() => () => disconnectSocket(), []);

  const handleSelectChat = (person) => {
    selectChat(person);
    setIsThreadOpen(true);
  };

  const handleBack = () => {
    setIsThreadOpen(false);
    closeChat();
  };

  // The sidebar menu passes an explicit intent; the mobile avatar calls this
  // with a click event, so anything other than "edit" opens the view state.
  const openProfile = (intent) => {
    setProfileIntent(intent === "edit" ? "edit" : "view");
    setIsProfileModalOpen(true);
  };

  const handleLogout = async () => {
    disconnectSocket();
    resetChatStore();
    await logout();
  };

  const currentUserId = getUserId(authUser);
  const selectedUserId = getUserId(selectedUser);
  const showListOnMobile = !(selectedUser && isThreadOpen);
  const partnerOnline = selectedUserId
    ? onlineUserIds.includes(selectedUserId) || Boolean(selectedUser?.isOnline)
    : false;
  const partnerTyping = Boolean(selectedUserId) && typingUserId === selectedUserId;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-page)] font-sans text-[var(--text-1)]">
      {/* 1. Left Nav Sidebar (Compact on tablet md, full on desktop lg) */}
      <NavSidebar
        user={authUser}
        view={view}
        onViewChange={setView}
        onOpenProfile={openProfile}
        onLogout={handleLogout}
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
          onOpenProfile={openProfile}
          user={authUser}
          onlineUserIds={onlineUserIds}
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
            partnerOnline={partnerOnline}
            partnerTyping={partnerTyping}
          />
        ) : (
          <EmptyConversation onStartChat={() => setView("contacts")} />
        )}
      </main>

      {/* Profile & Avatar Upload Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        intent={profileIntent}
        onClose={() => setIsProfileModalOpen(false)}
        onSignOut={handleLogout}
      />
    </div>
  );
}
