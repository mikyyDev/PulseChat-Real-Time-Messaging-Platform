export function getUserId(user) {
  if (!user) return null;
  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }
  const id = user._id ?? user.id;
  return id != null ? String(id) : null;
}

export function getInitials(name = "") {
  if (!name || typeof name !== "string") return "?";

  // Use Array.from to correctly handle multi-byte unicode characters & emojis
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    const letters = Array.from(parts[0]);
    return (letters[0] ?? "?").toUpperCase();
  }

  const firstLetter = Array.from(parts[0])[0] ?? "";
  const lastLetter = Array.from(parts[parts.length - 1])[0] ?? "";
  return (firstLetter + lastLetter).toUpperCase();
}

/**
 * Curated accessible pastel tints designed for dark mode interfaces.
 */
export const AVATAR_TINTS = [
  "bg-[#EDE7FF] text-[#6B46F2]",
  "bg-[#FFE7F0] text-[#C2417C]",
  "bg-[#DFF5F0] text-[#118A75]",
  "bg-[#FFF2DC] text-[#B4741A]",
  "bg-[#E4EEFF] text-[#2F63C7]",
  "bg-[#F2E6FF] text-[#8A3FD1]",
];

export function getAvatarTint(seed = "") {
  const str = String(seed ?? "");
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  const index = Math.abs(hash) % AVATAR_TINTS.length;
  return AVATAR_TINTS[index];
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isSameDay(a, b) {
  const dateA = toValidDate(a);
  const dateB = toValidDate(b);
  if (!dateA || !dateB) return false;

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function getCalendarDayDiff(target, now) {
  const utcTarget = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((utcNow - utcTarget) / (24 * 60 * 60 * 1000));
}

export function formatClockTime(value) {
  const date = toValidDate(value);
  return date ? timeFormatter.format(date) : "";
}

export function formatListTime(value, now = new Date()) {
  const date = toValidDate(value);
  if (!date) return "";

  const dayDiff = getCalendarDayDiff(date, now);

  if (dayDiff === 0) return timeFormatter.format(date);
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff > 1 && dayDiff < 7) return weekdayFormatter.format(date);

  if (date.getFullYear() === now.getFullYear()) {
    return shortDateFormatter.format(date);
  }

  return `${shortDateFormatter.format(date)}, ${date.getFullYear()}`;
}

export function formatDayLabel(value, now = new Date()) {
  const date = toValidDate(value);
  if (!date) return "";

  const dayDiff = getCalendarDayDiff(date, now);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return fullDateFormatter.format(date);
}

export function getMessagePreview(lastMessage, currentUserId) {
  if (!lastMessage) return "No messages yet";

  const text = lastMessage.text?.trim();
  const hasImage = Boolean(lastMessage.image);

  if (!text && !hasImage) return "No messages yet";

  const body = text ? (hasImage ? `📷 ${text}` : text) : "Sent a photo";

  const isMine =
    currentUserId != null &&
    lastMessage.senderId != null &&
    String(lastMessage.senderId) === String(currentUserId);

  return isMine ? `You: ${body}` : body;
}
