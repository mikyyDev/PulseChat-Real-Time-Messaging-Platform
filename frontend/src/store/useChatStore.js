import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/api.js";
import { getUserId } from "../lib/chat-utils.js";

//Resolves user-friendly error messages from Axios responses.
function resolveErrorMessage(err, fallback) {
  if (!err?.response) {
    return "Cannot reach the server. Please check your internet connection.";
  }
  return (
    err.response.data?.message ||
    err.response.data?.errors?.[0]?.msg ||
    fallback
  );
}

function upsertConversation(chats, partner, message) {
  const partnerId = getUserId(partner);
  if (!partnerId) return chats;

  const existing = chats.find((chat) => getUserId(chat) === partnerId);
  const base = existing ?? partner;

  const updatedConversation = {
    ...base,
    lastMessage: {
      text: message.text || "",
      image: message.image || null,
      createdAt: message.createdAt || new Date().toISOString(),
      senderId: message.senderId,
    },
  };

  return [
    updatedConversation,
    ...chats.filter((chat) => getUserId(chat) !== partnerId),
  ];
}

// Track active AbortController for message requests to prevent race conditions
let activeMessageAbortController = null;

export const useChatStore = create((set, get) => ({
  chats: [],
  contacts: [],
  messages: [],
  selectedUser: null,
  isLoadingChats: false,
  isLoadingContacts: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,

  /**
   * Fetches all active conversations ordered by latest activity.
   */
  fetchChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const { data } = await api.get("/messages/chats");
      set({ chats: Array.isArray(data) ? data : [] });
    } catch (err) {
      const errorMsg = resolveErrorMessage(
        err,
        "Unable to load conversations.",
      );
      set({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      set({ isLoadingChats: false });
    }
  },

  /**
   * Fetches all registered users available to chat with.
   */
  fetchContacts: async () => {
    set({ isLoadingContacts: true, error: null });
    try {
      const { data } = await api.get("/messages/contacts");
      set({ contacts: Array.isArray(data) ? data : [] });
    } catch (err) {
      const errorMsg = resolveErrorMessage(err, "Unable to load contacts.");
      set({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      set({ isLoadingContacts: false });
    }
  },

  /**
   * Selects an active chat partner and initiates loading message history.
   * Cancels any pending previous conversation fetch.
   */
  selectChat: (user) => {
    const nextUserId = getUserId(user);
    if (!nextUserId) return;

    const currentUserId = getUserId(get().selectedUser);
    if (currentUserId === nextUserId) return;

    // Reset unread count for the selected conversation locally
    set((state) => ({
      selectedUser: user,
      messages: [],
      error: null,
      chats: state.chats.map((c) =>
        getUserId(c) === nextUserId ? { ...c, unreadCount: 0 } : c,
      ),
    }));

    get().fetchMessages(nextUserId);
  },

  /**
   * Closes the active conversation and aborts in-flight requests.
   */
  closeChat: () => {
    if (activeMessageAbortController) {
      activeMessageAbortController.abort();
      activeMessageAbortController = null;
    }
    set({ selectedUser: null, messages: [], isLoadingMessages: false });
  },

  /**
   * Fetches message history with race-condition prevention using AbortController.
   */
  fetchMessages: async (userId) => {
    const targetId = getUserId(userId);
    if (!targetId) return;

    // Abort previous in-flight fetch to eliminate race conditions
    if (activeMessageAbortController) {
      activeMessageAbortController.abort();
    }
    activeMessageAbortController = new AbortController();

    set({ isLoadingMessages: true, error: null });

    try {
      const { data } = await api.get(`/messages/${targetId}`, {
        signal: activeMessageAbortController.signal,
      });

      // Verify the user hasn't switched away while request was in-flight
      if (getUserId(get().selectedUser) === targetId) {
        set({ messages: Array.isArray(data) ? data : [] });
      }
    } catch (err) {
      // Ignore cancellations from intentional user navigation
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        return;
      }

      if (getUserId(get().selectedUser) === targetId) {
        const errorMsg = resolveErrorMessage(
          err,
          "Unable to load this conversation.",
        );
        set({ error: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      if (getUserId(get().selectedUser) === targetId) {
        set({ isLoadingMessages: false });
      }
    }
  },

  sendMessage: async (contentOrText, imagePayload = null) => {
    const selectedUser = get().selectedUser;
    const receiverId = getUserId(selectedUser);

    if (!receiverId) {
      return { success: false, error: "No recipient selected" };
    }

    let text = "";
    let image = imagePayload;

    if (typeof contentOrText === "object" && contentOrText !== null) {
      text = contentOrText.text?.trim() || "";
      image = contentOrText.image || image;
    } else if (typeof contentOrText === "string") {
      text = contentOrText.trim();
    }

    if (!text && !image) {
      return { success: false, error: "Message cannot be empty" };
    }

    set({ isSendingMessage: true, error: null });

    try {
      const { data } = await api.post(`/messages/send/${receiverId}`, {
        text,
        image,
      });

      // Append sent message and update conversation list
      set((state) => ({
        messages: [...state.messages, data],
        chats: upsertConversation(state.chats, selectedUser, data),
      }));

      return { success: true, data };
    } catch (err) {
      const errorMsg = resolveErrorMessage(
        err,
        "Your message could not be sent.",
      );
      set({ error: errorMsg });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      set({ isSendingMessage: false });
    }
  },

  /**
   * Clears state on user logout.
   */
  resetChatStore: () => {
    if (activeMessageAbortController) {
      activeMessageAbortController.abort();
      activeMessageAbortController = null;
    }
    set({
      chats: [],
      contacts: [],
      messages: [],
      selectedUser: null,
      isLoadingChats: false,
      isLoadingContacts: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      error: null,
    });
  },
}));
