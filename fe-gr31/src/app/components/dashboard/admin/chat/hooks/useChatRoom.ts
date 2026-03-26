"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Aduan } from "@/types/aduan";
import {
  fetchAduanList,
  fetchAduanRoom,
  updateAduanStatus,
  sendResponse,
} from "../services";

export function useChatRoom() {
  const [aduanList, setAduanList] = useState<Aduan[]>([]);
  const [activeAduan, setActiveAduan] = useState<Aduan | null>(null);
  const [adminNama, setAdminNama] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadAduan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAduanList();
      setAduanList(data.aduan);
      setAdminNama(data.adminNama || "");
      setIsSuperAdmin(Boolean(data.isSuperAdmin));

      setActiveAduan((prev) => {
        if (!prev) return null;
        const updated = data.aduan.find((a) => a.ticketId === prev.ticketId);
        if (updated) {
          if (
            updated.messages.length !== prev.messages.length ||
            updated.status !== prev.status
          ) {
            return updated;
          }
        }
        return prev;
      });
    } catch {
      console.error("Gagal memuat data aduan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAduan();
  }, [loadAduan]);

  useEffect(() => {
    scrollToBottom();
  }, [activeAduan?.messages]);

  // Auto-refresh setiap 15 detik
  useEffect(() => {
    const interval = setInterval(() => {
      loadAduan();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAduan]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending || !activeAduan) return;

    setSending(true);
    try {
      await sendResponse(activeAduan.ticketId, inputValue.trim());
      setInputValue("");
      await loadAduan();
      scrollToBottom();
    } catch {
      console.error("Gagal mengirim balasan");
    } finally {
      setSending(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!activeAduan || actionLoading) return;

    setActionLoading(true);
    try {
      await updateAduanStatus(activeAduan.ticketId, action);
      await loadAduan();
    } catch {
      console.error("Gagal mengubah status");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = async (aduan: Aduan) => {
    setActiveAduan(aduan);

    try {
      const room = await fetchAduanRoom(aduan.ticketId);
      if (room.aduan?.ticketId) {
        setActiveAduan(room.aduan);
      }
      if (room.adminNama) {
        setAdminNama(room.adminNama);
      }
      setIsSuperAdmin(Boolean(room.isSuperAdmin));
    } catch (error) {
      console.error("Gagal memuat room chat aduan:", error);
    }
  };

  const goBackToList = () => {
    setActiveAduan(null);
    loadAduan();
  };

  const getMyRole = (aduan: Aduan): string => {
    if (isSuperAdmin) return "Super Admin";
    if (!adminNama) return "Guru BK";
    if (aduan.walas?.toLowerCase() === adminNama?.toLowerCase())
      return "Guru Wali";
    return "Guru BK";
  };

  const isGuruWali = (aduan: Aduan) =>
    aduan.walas?.toLowerCase() === adminNama?.toLowerCase();

  const myRole = activeAduan ? getMyRole(activeAduan) : "";
  const canForward = activeAduan
    ? isGuruWali(activeAduan) && activeAduan.status === "pending"
    : false;
  const canTindaklanjuti = activeAduan
    ? activeAduan.status !== "selesai" &&
      activeAduan.status !== "ditindaklanjuti" &&
      (isSuperAdmin ||
        activeAduan.status === "diteruskan" ||
        (isGuruWali(activeAduan) && activeAduan.status === "pending"))
    : false;
  const canSelesai = activeAduan
    ? activeAduan.status === "ditindaklanjuti" ||
      (isSuperAdmin && activeAduan.status !== "selesai")
    : false;

  return {
    // State
    aduanList,
    activeAduan,
    adminNama,
    isSuperAdmin,
    inputValue,
    loading,
    sending,
    actionLoading,
    messagesEndRef,
    myRole,
    canForward,
    canTindaklanjuti,
    canSelesai,
    // Actions
    setInputValue,
    handleSendMessage,
    handleAction,
    openDetail,
    goBackToList,
  };
}
