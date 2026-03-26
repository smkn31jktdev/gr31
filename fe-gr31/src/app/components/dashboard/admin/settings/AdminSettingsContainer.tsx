"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/dashboard/admin/layouts/sidebar";
import AdminNavbar from "@/app/components/dashboard/admin/layouts/navbar";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SettingsHeader from "./header/SettingsHeader";
import ProfilePicture from "./profile/ProfilePicture";
import SettingsForm from "./form/SettingsForm";
import { AlertMessage, LoadingState } from "./components";
import { useAdminProfile, usePhotoUpload, useSettingsForm } from "./hooks";

export default function AdminSettingsContainer() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/admin?expired=1",
    tokenKey: "adminToken",
  });

  const {
    name,
    setName,
    email,
    setEmail,
    originalEmail,
    setOriginalEmail,
    fotoProfil,
    setFotoProfil,
    initialLoading,
    message,
    setMessage,
  } = useAdminProfile();

  const { uploadingPhoto, handlePhotoUpload, handlePhotoDelete } =
    usePhotoUpload();

  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleSave,
    handleCancel,
  } = useSettingsForm();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          onToggleSidebar={() => setIsSidebarCollapsed((s) => !s)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((s) => !s)}
        />
        <main className="flex-1 overflow-auto bg-gray-50/50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <SettingsHeader />

            {message && <AlertMessage message={message} />}

            {initialLoading ? (
              <LoadingState />
            ) : (
              <div className="w-full">
                <ProfilePicture
                  fotoProfil={fotoProfil}
                  name={name}
                  email={email}
                  uploadingPhoto={uploadingPhoto}
                  handlePhotoUpload={(e) =>
                    handlePhotoUpload(e, setFotoProfil, setMessage)
                  }
                  handlePhotoDelete={() =>
                    handlePhotoDelete(setFotoProfil, setMessage)
                  }
                />

                <SettingsForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  handleSave={(e) =>
                    handleSave(
                      e,
                      name,
                      email,
                      originalEmail,
                      setOriginalEmail,
                      setMessage,
                    )
                  }
                  handleCancel={() =>
                    handleCancel(setName, setEmail, setMessage)
                  }
                  loading={loading}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
