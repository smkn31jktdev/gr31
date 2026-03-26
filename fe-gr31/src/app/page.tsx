"use client";

import Navbar from "@/app/components/layouts/navbar";
import Hero from "@/app/components/home/hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100">
      <Navbar />

      <div>
        <Hero />
      </div>
    </main>
  );
}

