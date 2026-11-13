import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/useAuthStore";
import { loginSchema } from "../schemas/auth.schema.js";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import AuthIllustration from "../components/AuthIllustration";
import logo from "../asset/image/logo.webp";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    await login(data);
  };

  const isLoading = isLoggingIn || isSubmitting;

  return (
    <div className="flex min-h-screen bg-[#1a1035]">
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
              Welcome back
            </h1>
            <p className="mb-8 text-base text-slate-400">
              Sign in to jump back into your chats, teams and channels.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
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
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transition-colors ${
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transition-colors ${
                      errors.password ? "text-rose-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
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
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-8 text-center text-sm text-slate-400">
              New to PulseChat?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Create an account
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
