"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { TLoginForm } from "@/types/index.type";
import { useLogin } from "@/services/api/auth.api";
import VoidLogo from "@/assets/void_manage_logo.png";

export function LoginPage() {
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
        </CardContent>
      </Card>
    </div>
  );
}
