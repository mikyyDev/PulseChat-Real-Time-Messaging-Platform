import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import Avatar from "./Avatar";

/**
 * High-end Profile & Avatar Upload Modal:
 * - Direct Cloudinary photo upload with real-time preview
 * - Size & format client validation (< 2MB, image types)
 * - Themed in PulseChat's signature deep violet glassmorphism
 */
export default function ProfileModal({ isOpen, onClose }) {
  const authUser = useAuthStore((state) => state.authUser);
  const updateProfilePic = useAuthStore((state) => state.updateProfilePic);
  const isUpdatingProfile = useAuthStore((state) => state.isUpdatingProfile);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isUpdatingProfile) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUpdatingProfile]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 2MB");
      return;
    }

    // Validate type
    if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)) {
      setErrorMsg("Only JPG, PNG, GIF, or WebP images are allowed");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profilePic", selectedFile);

    const res = await updateProfilePic(formData);
    if (res?.success) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isUpdatingProfile) return;
    handleCancelSelection();
    onClose();
  };

  const displayAvatar = previewUrl || authUser?.profilePic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#160E2A] p-6 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200"
      >
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[#6D5AE6]/20 blur-3xl"
        />

        {/* Header with Close Button */}
        <div className="relative flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5AE6] to-[#8A76FF] text-white shadow-md shadow-[#6D5AE6]/30">
              <User className="h-4 w-4" />
            </span>
            <h3
              id="profile-modal-title"
              className="text-base font-extrabold tracking-tight text-white"
            >
              Profile Settings
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isUpdatingProfile}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[#8F84B3] transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar Upload Centerpiece */}
        <div className="relative mt-2 flex flex-col items-center text-center">
          <div className="relative group">
            {/* Outer Decorative Ring */}
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#6D5AE6]/30 shadow-2xl shadow-[#6D5AE6]/20 transition-all group-hover:ring-[#6D5AE6]/60">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={authUser?.name || "Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Avatar
                  name={authUser?.name}
                  size="xl"
                  className="h-full w-full !text-3xl"
                />
              )}
            </div>

            {/* Camera Overlay Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingProfile}
              title="Change profile picture"
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6D5AE6] to-[#8A76FF] text-white shadow-lg shadow-[#6D5AE6]/50 ring-4 ring-[#160E2A] transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Name & Account Badge */}
          <div className="mt-4 flex items-center gap-1.5">
            <h4 className="text-lg font-extrabold text-white">
              {authUser?.name || "User"}
            </h4>
            <span
              title="Verified Account"
              className="text-[#7B61FF]"
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>

          <p className="mt-0.5 text-xs text-[#8F84B3]">
            {authUser?.email || "PulseChat Member"}
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span>Active Session</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-500/10 p-2.5 text-center text-xs font-semibold text-rose-400 border border-rose-500/20">
            {errorMsg}
          </div>
        )}

        {/* Selected Photo Actions */}
        {selectedFile && (
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 text-center animate-in fade-in duration-200">
            <p className="truncate text-xs font-medium text-white/90">
              Selected: <span className="text-[#8A76FF] font-semibold">{selectedFile.name}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-[#8F84B3]">
              {(selectedFile.size / 1024).toFixed(0)} KB ready to upload
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCancelSelection}
                disabled={isUpdatingProfile}
                className="flex-1 rounded-xl bg-white/[0.05] py-2 text-xs font-semibold text-[#8F84B3] transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUpdatingProfile}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D5AE6] to-[#8A76FF] py-2 text-xs font-bold text-white shadow-lg shadow-[#6D5AE6]/30 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quick upload trigger button if no file selected yet */}
        {!selectedFile && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-3 text-xs font-semibold text-[#9C93B8] transition-all hover:border-[#6D5AE6]/60 hover:bg-[#6D5AE6]/5 hover:text-white cursor-pointer"
            >
              <Upload className="h-4 w-4 text-[#7B61FF]" />
              <span>Choose photo from computer</span>
            </button>
            <p className="mt-2 text-center text-[10px] text-[#8F84B3]/70">
              Max file size 2MB • JPG, PNG, GIF or WebP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

