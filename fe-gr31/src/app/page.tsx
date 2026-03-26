"use client";

import { motion } from "motion/react";
import Navbar from "@/app/components/layouts/navbar";
import Hero from "@/app/components/home/hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100">
        <Navbar />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <Hero />
      </motion.div>
    </main>
  );
}

