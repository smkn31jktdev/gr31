"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  authProxyService,
  type AdminLoginPayload,
  type AuthLoginResponse,
  ApiError,
} from "@/core/services";

function getRoleRedirects(): Record<string, string> {
  try {
    const raw = process.env.NEXT_PUBLIC_ROLE_REDIRECTS;
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse error, fall back to empty
  }
  return {};
}

const ROLE_REDIRECTS = getRoleRedirects();
const DEFAULT_REDIRECT =
  process.env.NEXT_PUBLIC_DEFAULT_ADMIN_REDIRECT || "/page/admin";

function resolveRedirect(email: string): string {
  return ROLE_REDIRECTS[email] ?? DEFAULT_REDIRECT;
}

type SnackbarState = {
  message: string;
  type: "success" | "error";
} | null;

function LoginAdminForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const sanitizeInput = (input: string): string =>
    input
      .replace(/<[^>]*>/g, "")
      .replace(/[{};:']/g, "")
      .trim();

  const showNotification = useCallback(
    (message: string, type: "success" | "error") => {
      setSnackbar({ message, type });
    },
    [],
  );

  useEffect(() => {
    const expired = searchParams.get("expired");
    if (expired === "1" || expired === "true") {
      showNotification(
        "Sesi anda telah berakhir, silakan masuk kembali",
        "error",
      );
    }
  }, [searchParams, showNotification]);

  useEffect(() => {
    if (snackbar) {
      setSnackbarVisible(true);
      const timer = setTimeout(() => setSnackbarVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedEmail || !sanitizedPassword) {
      showNotification("Email dan kata sandi harus diisi", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: AdminLoginPayload = {
        email: sanitizedEmail,
        password: sanitizedPassword,
      };

      const data: AuthLoginResponse =
        await authProxyService.adminLogin(payload);

      localStorage.setItem("adminToken", data.token);
      if (data.admin) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", sanitizedEmail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      showNotification(
        "Login berhasil! Mengarahkan ke dashboard...",
        "success",
      );

      const redirectUrl = resolveRedirect(data.admin?.email ?? "");
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        showNotification(error.message || "Login gagal", "error");
      } else {
        console.error("Login error:", error);
        showNotification("Terjadi kesalahan saat login", "error");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-16 top-12 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl"
          aria-hidden
        />
      </div>

      <div className="max-w-md w-full backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <Image
              src="/assets/img/navbar.png"
              alt="Logo SMKN 31 Jakarta"
              width={120}
              height={120}
              className="mx-auto rounded-full"
              style={{ width: 120, height: "auto" }}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--btn)] to-[var(--highlight)] bg-clip-text text-transparent mb-2">
            Selamat Datang
          </h1>
          <p className="text-[var(--foreground)] text-sm">
            Masuk dan monitoring siswa setiap hari!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="admin-email"
              className="block text-sm font-semibold text-[var(--foreground)] mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                required
                disabled={isSubmitting}
                className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn)] focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Masukkan email Anda"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="admin-password"
              className="block text-sm font-semibold text-[var(--foreground)] mb-2"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                required
                disabled={isSubmitting}
                className="pl-12 pr-12 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--btn)] focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="admin-remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 text-[var(--btn)] focus:ring-[var(--btn)] border-gray-300 rounded"
            />
            <label
              htmlFor="admin-remember-me"
              className="ml-2 block text-sm text-[var(--foreground)]"
            >
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[var(--btn)] to-[var(--highlight)] text-white py-3 px-4 rounded-xl font-semibold transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--btn)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>
      </div>

      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 transform transition-all duration-500 z-50 ${
          snackbarVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-6 opacity-0 scale-95"
        } ${
          snackbar?.type === "success"
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400"
            : snackbar?.type === "error"
              ? "bg-gradient-to-r from-rose-500 to-rose-600 border-rose-400"
              : "bg-gradient-to-r from-gray-500 to-gray-600 border-gray-400"
        } text-white px-6 py-4 rounded-2xl shadow-2xl border-2 pointer-events-none max-w-sm`}
        aria-live="assertive"
        role="alert"
      >
        <div className="flex items-center gap-3">
          {snackbar?.type === "error" && (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          {snackbar?.type === "success" && (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <div className="font-medium text-sm leading-relaxed">
            {snackbar?.message}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginAdmin() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <LoginAdminForm />
    </Suspense>
  );
}
