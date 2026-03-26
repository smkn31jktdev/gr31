"use client";

import { useState } from "react";
import { useChatRoom } from "../../hooks";
import AdminSidebar from "@/app/components/dashboard/admin/layouts/sidebar";
import { ChatHeader, ChatList, ChatThread } from "..";

export default function AdminRoomChat() {
  const {
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
    setInputValue,
    handleSendMessage,
    handleAction,
    openDetail,
    goBackToList,
  } = useChatRoom();

  // Sidebar specific states
  const [isSidebarCollapsed, _setIsSidebarCollapsed] = useState(true);
  void _setIsSidebarCollapsed;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-row h-screen max-h-[100dvh] bg-slate-50 font-poppins overflow-hidden">
      {/* SIDEBAR COMPONENT */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <ChatHeader
          activeAduan={activeAduan}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 overflow-hidden relative">
          <ChatList
            aduanList={aduanList}
            activeAduan={activeAduan}
            loading={loading}
            adminNama={adminNama}
            isSuperAdmin={isSuperAdmin}
            onOpenThread={openDetail}
          />

          <ChatThread
            activeAduan={activeAduan}
            inputValue={inputValue}
            sending={sending}
            actionLoading={actionLoading}
            myRole={myRole}
            canForward={canForward}
            canTindaklanjuti={canTindaklanjuti}
            canSelesai={canSelesai}
            messagesEndRef={messagesEndRef}
            onBackToList={goBackToList}
            onInputValueChange={setInputValue}
            onSendMessage={handleSendMessage}
            onHandleAction={handleAction}
          />
        </div>
      </div>
    </div>
  );
}
