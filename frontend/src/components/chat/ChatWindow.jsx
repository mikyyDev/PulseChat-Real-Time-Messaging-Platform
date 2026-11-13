import { Fragment, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
  X,
  Loader2,
  MessagesSquare,
} from "lucide-react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import { formatDayLabel, getUserId, isSameDay } from "../../lib/chat-utils";

function shouldShowHeader(message, previous) {
  if (!previous) return true;
  if (String(previous.senderId) !== String(message.senderId)) return true;
  const timeDiff =
    new Date(message.createdAt).getTime() -
    new Date(previous.createdAt).getTime();
  return timeDiff > 5 * 60 * 1000;
}

function BubbleSkeleton({ align = "start" }) {
  return (
    <div
      className={`flex animate-pulse items-end gap-3 ${
        align === "end" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="h-8 w-8 rounded-full bg-white/10" />
      <div className="h-10 w-48 rounded-2xl bg-white/6" />
    </div>
  );
}

/**
 * Message Input Composer matching the screenshot:
 * Attachment button, "Type a message..." input, emoji icon,
 * and purple circular send button.
 */
function MessageComposer({ onSend, isSending }) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const canSend = (text.trim().length > 0 || imagePreview) && !isSending;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSend) return;

    const currentText = text.trim();
    const currentImage = imagePreview;

    const res = await onSend(currentText, currentImage);
    if (res?.success) {
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="relative z-20 px-5 pb-5 pt-2">
      {/* Attached Image Preview */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative inline-block overflow-hidden rounded-xl border border-white/10 bg-[#251B48] shadow-lg">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-16 w-16 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Input Pill Bar */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-white/6 bg-[#22173F] p-1.5 shadow-xl shadow-black/20 transition-colors focus-within:border-[#6D5AE6]/60">
        {/* Hidden File Picker */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Paperclip Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach an image"
          title="Attach image"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6D5AE6]/15 text-[#9C8BF8] transition-colors hover:bg-[#6D5AE6]/30 hover:text-white"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-xs text-white placeholder-[#8F84B3] outline-none"
        />

        {/* Emoji Button */}
        <button
          type="button"
          disabled
          aria-label="Emoji picker"
          title="Emoji picker — coming soon"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8F84B3] transition-colors hover:text-white"
        >
          <Smile className="h-4 w-4" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6D5AE6] text-white shadow-md shadow-[#6D5AE6]/30 transition-all hover:bg-[#7C68F0] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#34275E] disabled:text-[#8F84B3]/40 disabled:shadow-none"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Main Chat Window View matching the screenshot's 3rd column:
 * - Clean header with name + online badge + Audio, Video, Profile action pills
 * - Real conversation thread
 * - Floating composer bar
 * - Themed in deep blue-black palette.
 */
export default function ChatWindow({
  user,
  currentUserId,
  messages,
  isLoading,
  isSending,
  onSend,
  onBack,
}) {
  const bottomRef = useRef(null);
  const partnerId = getUserId(user);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, partnerId]);

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col bg-[#1A1132] select-none">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/6 bg-[#1A1132]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          {/* Back button on mobile */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8F84B3] transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Contact header info */}
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              name={user?.name}
              src={user?.profilePic}
              size="md"
              isOnline={Boolean(user?.isOnline)}
            />

            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold tracking-tight text-white">
                {user?.name}
              </h2>
              {user?.isOnline && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Online</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Pills: Call, Video (Audio & Video coming soon) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title="Audio call — coming soon"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#231842] text-[#9C93B8] transition-colors hover:text-white disabled:opacity-50"
          >
            <Phone className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled
            title="Video call — coming soon"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#231842] text-[#9C93B8] transition-colors hover:text-white disabled:opacity-50"
          >
            <Video className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Message History Thread */}
      <div
        role="log"
        aria-label={`Conversation with ${user?.name}`}
        className="scrollbar-thin relative z-10 flex-1 overflow-y-auto px-6 py-5"
      >
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <BubbleSkeleton />
            <BubbleSkeleton align="end" />
            <BubbleSkeleton />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#231842] text-[#9C93B8]">
              <MessagesSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Start a conversation with {user?.name}
              </p>
              <p className="mt-1 text-xs text-[#9C93B8]">
                Type a message below to connect.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const isMine =
                Boolean(currentUserId) &&
                String(message.senderId) === String(currentUserId);
              const showDaySeparator =
                !previous || !isSameDay(previous.createdAt, message.createdAt);

              return (
                <Fragment key={message._id ?? `${message.createdAt}-${index}`}>
                  {showDaySeparator && (
                    <div className="my-2 flex justify-center">
                      <span className="rounded-full bg-[#22173F] px-3 py-0.5 text-[10px] font-bold text-[#8F84B3] shadow-sm">
                        {formatDayLabel(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <MessageBubble
                    message={message}
                    isMine={isMine}
                    showHeader={shouldShowHeader(message, previous)}
                    sender={isMine ? null : user}
                  />
                </Fragment>
              );
            })}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating Composer */}
      <MessageComposer onSend={onSend} isSending={isSending} />
    </div>
  );
}
