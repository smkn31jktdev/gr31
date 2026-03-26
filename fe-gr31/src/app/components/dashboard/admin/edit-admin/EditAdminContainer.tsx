"use client";

import { useState } from "react";
import AdminSidebar from "../layouts/sidebar";
import AdminNavbar from "../layouts/navbar";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import EditAdminHeader from "./header/EditAdminHeader";
import EditAdminTable from "./table/EditAdminTable";
import EditAdminModal from "./modal/EditAdminModal";
import DeleteAdminModal from "./modal/DeleteAdminModal";
import {
  useSuperAdminAuth,
  useAdminList,
  useEditAdmin,
  useDeleteAdmin,
} from "./hooks";

export default function EditAdminContainer() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useSessionTimeout({
    timeoutMinutes: 30,
    redirectPath: "/page/login/admin?expired=1",
    tokenKey: "adminToken",
  });

  const { isAllowed } = useSuperAdminAuth();

  const {
    admins,
    setAdmins,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredAdmins,
  } = useAdminList(isAllowed);

  const {
    selectedAdmin,
    isModalOpen,
    isSubmitting,
    editForm,
    handleEditClick,
    closeModal,
    handleFormChange,
    handleUpdateAdmin,
  } = useEditAdmin();

  const {
    isDeleting,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    handleDeleteRequest,
    handleCancelDelete,
    handleConfirmDeleteAdmin,
  } = useDeleteAdmin();

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleModalClose = () => {
    closeModal();
    setIsDeleteConfirmOpen(false);
  };

  if (isAllowed === null) {
    return null;
  }

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
            <EditAdminHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <EditAdminTable
              adminsCount={admins.length}
              filteredAdmins={filteredAdmins}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onEditClick={handleEditClick}
            />
          </div>
        </main>
      </div>

      <EditAdminModal
        isOpen={isModalOpen}
        selectedAdmin={selectedAdmin}
        editForm={editForm}
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
        onFormChange={handleFormChange}
        onSubmit={(e) => handleUpdateAdmin(e, setAdmins)}
        onDeleteRequest={() => handleDeleteRequest(selectedAdmin)}
      />

      <DeleteAdminModal
        isOpen={isDeleteConfirmOpen}
        selectedAdmin={selectedAdmin}
        isDeleting={isDeleting}
        onCancel={handleCancelDelete}
        onConfirm={() =>
          handleConfirmDeleteAdmin(selectedAdmin, setAdmins, handleModalClose)
        }
      />
    </div>
  );
}
