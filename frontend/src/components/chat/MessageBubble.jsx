import { CheckCheck } from "lucide-react";
import Avatar from "./Avatar";
import { formatClockTime } from "../../lib/chat-utils";

export default function MessageBubble({ message, isMine, showHeader, sender }) {
  const time = formatClockTime(message.createdAt);

  return (
    <div
      className={`group flex items-end gap-2.5 ${
        isMine ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar for incoming messages */}
      {!isMine && (
        <div className="shrink-0 pb-1">
          {showHeader ? (
            <Avatar
              name={sender?.name ?? "User"}
              src={sender?.profilePic}
              size="xs"
            />
          ) : (
            <div className="w-8" aria-hidden="true" />
          )}
        </div>
      )}

      {/* Bubble + Metadata */}
      <div
        className={`flex min-w-0 max-w-[80%] flex-col sm:max-w-[65%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {/* Bubble container */}
        <div
          className={`relative overflow-hidden rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
            isMine
              ? "rounded-br-sm bg-linear-to-tr from-[#634EE2] to-[#7B61FF] text-white shadow-md shadow-[#6D5AE6]/20"
              : "rounded-bl-sm bg-[#22173F] text-white/95 border border-white/4"
          }`}
        >
          {/* Optional Image Attachment */}
          {message.image && (
            <div className="mb-2 overflow-hidden rounded-xl">
              <img
                src={message.image}
                alt="Attachment"
                className="max-h-64 w-full object-cover transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <p className="whitespace-pre-wrap wrap-break-word">
              {message.text}
            </p>
          )}
        </div>

        {/* Timestamp & Delivery Status */}
        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[10px] font-medium text-[#8F84B3]`}
        >
          <span>{time}</span>
          {isMine && <CheckCheck className="h-3 w-3 text-[#9C8BF8]" />}
        </div>
      </div>
    </div>
  );
}
