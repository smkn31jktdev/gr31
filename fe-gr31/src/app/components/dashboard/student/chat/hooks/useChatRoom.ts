"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Aduan } from "@/types/aduan";
import { fetchAduan, sendAduan } from "../services";

export function useChatRoom() {
  const [aduanList, setAduanList] = useState<Aduan[]>([]);
  const [activeAduan, setActiveAduan] = useState<Aduan | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadAduan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAduan();
      setAduanList(data);

      setActiveAduan((prev) => {
        if (!prev) return null;
        const updated = data.find((a) => a.ticketId === prev.ticketId);
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
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal memuat data aduan";
      console.error("Gagal memuat data aduan:", msg);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAduan();
  }, [loadAduan]);

  useEffect(() => {
    scrollToBottom();
  }, [activeAduan?.messages, isCreatingNew]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadAduan();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAduan]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    setErrorMsg(null);
    try {
      const result = await sendAduan(inputValue.trim(), activeAduan?.ticketId);

      setInputValue("");

      if (result.success) {
        await loadAduan();

        if (isCreatingNew && result.aduan) {
          setIsCreatingNew(false);
          setActiveAduan(result.aduan as Aduan);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim aduan";
      setErrorMsg(msg);
    } finally {
      setSending(false);
    }
  };

  const openThread = (aduan: Aduan) => {
    setIsCreatingNew(false);
    setActiveAduan(aduan);
  };

  const startNewAduan = () => {
    setActiveAduan(null);
    setIsCreatingNew(true);
  };

  const goBackToList = () => {
    setActiveAduan(null);
    setIsCreatingNew(false);
  };

  return {
    // State
    aduanList,
    activeAduan,
    isCreatingNew,
    inputValue,
    loading,
    sending,
    errorMsg,
    messagesEndRef,
    // Actions
    setInputValue,
    setErrorMsg,
    handleSendMessage,
    openThread,
    startNewAduan,
    goBackToList,
  };
}
