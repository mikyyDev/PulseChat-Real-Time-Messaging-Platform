import { getAvatarTint, getInitials } from "../../lib/chat-utils";

const SIZES = {
  xs: "h-8 w-8 text-[11px]",
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-[13px]",
  lg: "h-11 w-11 text-sm",
  xl: "h-20 w-20 text-2xl",
};

export default function Avatar({
  name = "",
  src = "",
  size = "md",
  isOnline = false,
  className = "",
}) {
  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold shadow-sm ${
          src ? "" : getAvatarTint(name)
        } ${SIZES[size] ?? SIZES.md}`}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="leading-none tracking-tight">
            {getInitials(name)}
          </span>
        )}
      </span>

      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-[#18102E] bg-emerald-500 shadow-sm ${
            size === "xl" ? "h-5 w-5 border-[3px]" : "h-3 w-3"
          }`}
          title="Online"
        />
      )}
    </div>
  );
}
