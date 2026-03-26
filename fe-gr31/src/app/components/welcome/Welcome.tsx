"use client";

import Link from "next/link";
import { UserCog, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

const roles = [
  {
    id: "admin",
    title: "Masuk sebagai Admin",
    icon: UserCog,
    cardOverlayClass: "from-blue-600 to-sky-500",
    iconBgClass: "from-blue-600 to-sky-500",
    accentClass: "from-blue-600 to-sky-500",
    hoverTextClass: "group-hover:text-blue-700",
    buttonTextClass: "text-blue-600",
    path: "/page/login/admin",
  },
  {
    id: "student",
    title: "Masuk sebagai Siswa",
    icon: GraduationCap,
    cardOverlayClass: "from-emerald-500 to-cyan-400",
    iconBgClass: "from-emerald-500 to-cyan-400",
    accentClass: "from-emerald-500 to-cyan-400",
    hoverTextClass: "group-hover:text-emerald-700",
    buttonTextClass: "text-emerald-600",
    path: "/page/login/siswa",
  },
] as const;

export default function Welcome() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[var(--btn)] via-[var(--highlight)] to-[var(--primary)] bg-clip-text text-transparent">
            Halo!
          </h1>
          <p className="text-base md:text-lg text-gray-700 font-medium">
            Selamat Datang, Silakan pilih akun anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-2 md:px-4">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={role.path}
              onMouseEnter={() => setHoveredCard(role.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02]"
            >
              <div
                className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-transparent transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${role.cardOverlayClass} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                ></div>

                <div className="relative p-6 md:p-8">
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br ${role.iconBgClass}`}
                      ></div>
                      <div
                        className={`relative rounded-full p-5 md:p-6 transform group-hover:rotate-6 transition-transform duration-300 bg-gradient-to-br ${role.iconBgClass}`}
                      >
                        <role.icon className="w-10 h-10 md:w-14 md:h-14 text-white" />
                      </div>
                    </div>
                  </div>

                  <h2
                    className={`text-xl md:text-2xl font-semibold mb-3 text-center ${role.hoverTextClass} transition-colors duration-300`}
                    style={{ color: "var(--foreground)" }}
                  >
                    {role.title}
                  </h2>

                  <div className="flex items-center justify-center">
                    <div
                      className={`flex items-center font-semibold group-hover:opacity-80 transition-opacity text-xs md:text-sm ${role.buttonTextClass}`}
                    >
                      <span className="mr-2">Masuk Sekarang</span>
                      <ArrowRight
                        className={`w-4 h-4 transition-transform duration-300 ${
                          hoveredCard === role.id ? "translate-x-2" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`h-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left bg-gradient-to-r ${role.accentClass}`}
                ></div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="flex justify-center mb-4">
            <Link
              href="/"
              aria-label="Kembali ke Beranda"
              className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-full border border-black/10 text-[var(--btn)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--btn)] hover:text-white hover:border-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>

          <p className="text-sm text-gray-600">
            Gerakan Tujuh Kebiasaan Anak Indonesia Hebat
          </p>
        </div>
      </div>
    </div>
  );
}
