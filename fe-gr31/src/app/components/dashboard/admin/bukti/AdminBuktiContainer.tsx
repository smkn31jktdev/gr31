"use client";

import { useState, useEffect } from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import AdminSidebar from "@/app/components/dashboard/admin/layouts/sidebar";
import AdminNavbar from "@/app/components/dashboard/admin/layouts/navbar";
import BuktiHeader from "./header/BuktiHeader";
import BuktiList from "./list/BuktiList";
import BuktiModal from "./modal/BuktiModal";
import { Bukti } from "./types";

export default function AdminBuktiContainer() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [buktiList, setBuktiList] = useState<Bukti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBukti, setSelectedBukti] = useState<Bukti | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/admin?expired=1",
    tokenKey: "adminToken",
  });

  useEffect(() => {
    const fetchBukti = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Sesi admin tidak ditemukan. Silakan login ulang.");
          return;
        }

        const response = await fetch("/api/admin/bukti", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const errorMessage =
            typeof errorBody?.error === "string"
              ? errorBody.error
              : `Gagal memuat bukti (HTTP ${response.status})`;
          throw new Error(errorMessage);
        }

        const data = (await response.json()) as unknown;
        if (!Array.isArray(data)) {
          throw new Error("Format respons bukti tidak valid");
        }

        setBuktiList(data);
      } catch (error) {
        console.error("Error fetching bukti:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data bukti",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBukti();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const openModal = (bukti: Bukti) => {
    setSelectedBukti(bukti);
    setIsModalOpen(true);
    if (bukti.imageData && bukti.imageMimeType) {
      setImageDataUrl(`data:${bukti.imageMimeType};base64,${bukti.imageData}`);
    } else if (bukti.imageUrl) {
      setImageDataUrl(bukti.imageUrl);
    } else {
      loadImageFromFile(bukti.foto);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBukti(null);
    setImageDataUrl(null);
    setImageLoading(false);
  };

  const loadImageFromFile = async (fotoPath: string) => {
    if (!fotoPath || !fotoPath.startsWith("/uploads/bukti/")) {
      setImageDataUrl(null);
      return;
    }

    setImageLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setImageDataUrl(null);
        return;
      }

      const filename = fotoPath.split("/").pop();
      const response = await fetch(`/api/uploads/bukti/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load image");
      }

      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setImageDataUrl(dataUrl);
    } catch (error) {
      console.error("Error loading image:", error);
      setImageDataUrl(null);
    } finally {
      setImageLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageDataUrl || !selectedBukti) return;

    const namaFormatted = selectedBukti.nama.toLowerCase().replace(/\s+/g, "-");
    const bulanFormatted = selectedBukti.bulan.replace("-", "");
    const extension = imageDataUrl.includes("data:image/png") ? "png" : "jpg";
    const filename = `bukti_${namaFormatted}_${bulanFormatted}.${extension}`;

    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 overflow-auto bg-gray-50/50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <BuktiHeader />
            <BuktiList
              loading={loading}
              error={error}
              buktiList={buktiList}
              openModal={openModal}
            />
          </div>
        </main>
      </div>

      <BuktiModal
        selectedBukti={selectedBukti}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        imageLoading={imageLoading}
        imageDataUrl={imageDataUrl}
        downloadImage={downloadImage}
      />
    </div>
  );
}
