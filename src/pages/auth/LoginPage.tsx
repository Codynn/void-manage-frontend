"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import type { TLoginForm } from "@/types/index.type";
import { useLogin } from "@/services/api/auth.api";
import VoidLogo from "@/assets/void_manage_logo.png";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  MENTOR: "/mentor/dashboard",
  INTERN: "/intern/dashboard",
};

const GOOGLE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  no_account_for_email:
    "No account found for that Google email. Ask your admin to create one first.",
  email_not_verified: "That Google account's email isn't verified.",
  token_exchange_failed: "Google sign-in failed. Please try again.",
  userinfo_failed: "Could not fetch your Google profile. Please try again.",
  missing_code: "Google sign-in was cancelled.",
  google_auth_failed: "Google sign-in failed. Please try again.",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginForm>();

  //   API CALLS
  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: TLoginForm) => {
    if (isPending) return;
    login(data);
  };

  // After a Google auth attempt, the backend redirects back to this page -
  // either with ?accessToken=...&role=... (success) or ?error=<reason>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const role = params.get("role");
    const error = params.get("error");

    if (accessToken) {
      Cookies.set("accessToken", accessToken);
      toast.success("Login successful!");

      navigate(ROLE_HOME[role?.toUpperCase() ?? ""] ?? "/");
      return;
    }

    if (error) {
      toast.error(
        GOOGLE_AUTH_ERROR_MESSAGES[error] ||
          "Google sign-in failed. Please try again.",
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = () => {
    const baseURL =
      import.meta.env.VITE_BASEURL || "https://manage-api.voidnepal.com.np/api";
    const requestTo = `${window.location.origin}/auth/login`;
    window.location.href = `${baseURL}/auth/google?requestTo=${encodeURIComponent(requestTo)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-green-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-400/20 to-green-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <Card className="w-full max-w-md bg-white/90 border-white/20 backdrop-blur-xl shadow-2xl shadow-black/10 relative z-10">
        <CardHeader className="text-center space-y-6 pb-6">
          {/* Enhanced logo container */}
          <div className="mx-auto relative">
            <div className="w-40 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center p-3 shadow-lg border border-gray-200/50">
              <img
                src={VoidLogo}
                alt="Void Nepal Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-lg -z-10" />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
              Void Nepal
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 block"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="intern@voidnepal.com"
                {...register("email", { required: true })}
                className="h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20 focus:bg-white transition-all duration-200 rounded-xl"
              />
              {errors.email && (
                <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                  Email is required
                </span>
              )}
            </div>

            <div className="space-y-2 relative">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 block"
              >
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { required: true })}
                className="h-12 pr-10 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20 focus:bg-white transition-all duration-200 rounded-xl"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.password && (
                <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                  Password is required
                </span>
              )}
            </div>

            <Button
              disabled={isPending}
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin mr-2 w-4 h-4" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              or
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold rounded-xl gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.66v3.03h3.86c2.26-2.09 3.56-5.17 3.56-8.93Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3.03c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.12A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.26A7.2 7.2 0 0 1 4.89 12c0-.78.14-1.55.38-2.26V6.62H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.12Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.12C6.22 6.87 8.87 4.75 12 4.75Z"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
