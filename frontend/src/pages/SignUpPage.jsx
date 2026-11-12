import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/useAuthStore";
import { PASSWORD_MIN_LENGTH, signupSchema } from "../schemas/auth.schema.js";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AuthIllustration from "../components/AuthIllustration";
import logo from "../asset/image/logo.webp";

export default function SignUpPage() {
  const { signup, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    // Validate when a field is first left, then live-correct it as the user types.
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    // Send only the fields expected by the backend API.
    await signup({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  const isLoading = isSigningUp || isSubmitting;

  return (
    <div className="flex min-h-screen bg-[#1a1035]">
      {/* ─── Left: Form Side ─── */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-5">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="PulseChat" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-white">
              PulseChat
            </span>
          </Link>
          <a
            href="#"
            className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Need help?
          </a>
        </nav>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white">
              Create account
            </h1>
            <p className="mb-8 text-base text-slate-400">
              Start chatting with your team in seconds. It's free!
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Full name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Full name
                </label>
                <div className="relative">
                  <User
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                      errors.name ? "text-rose-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    {...register("name")}
                    className={`w-full rounded-lg border bg-[#251b48] py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all ${
                      errors.name
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400 animate-in fade-in slide-in-from-top-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                      errors.email ? "text-rose-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                    className={`w-full rounded-lg border bg-[#251b48] py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-all ${
                      errors.email
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400 animate-in fade-in slide-in-from-top-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                      errors.password ? "text-rose-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password", { deps: ["confirmPassword"] })}
                    className={`w-full rounded-lg border bg-[#251b48] py-3 pl-11 pr-11 text-white placeholder-slate-500 outline-none transition-all ${
                      errors.password
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400 animate-in fade-in slide-in-from-top-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                      errors.confirmPassword
                        ? "text-rose-400"
                        : "text-slate-500"
                    }`}
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                    {...register("confirmPassword")}
                    className={`w-full rounded-lg border bg-[#251b48] py-3 pl-11 pr-11 text-white placeholder-slate-500 outline-none transition-all ${
                      errors.confirmPassword
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    aria-pressed={showConfirmPassword}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400 animate-in fade-in slide-in-from-top-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.confirmPassword.message}</span>
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right: Illustration Side (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <AuthIllustration />
      </div>
    </div>
  );
}
