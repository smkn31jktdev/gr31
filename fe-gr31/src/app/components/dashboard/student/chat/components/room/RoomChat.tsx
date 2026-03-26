"use client";

import { useRouter } from "next/navigation";
import { useChatRoom } from "../../hooks";
import { ChatHeader, ChatList, ChatThread } from "..";

export default function RoomChat() {
  const router = useRouter();

  const {
    aduanList,
    activeAduan,
    isCreatingNew,
    inputValue,
    loading,
    sending,
    errorMsg,
    messagesEndRef,
    setInputValue,
    setErrorMsg,
    handleSendMessage,
    openThread,
    startNewAduan,
    goBackToList,
  } = useChatRoom();

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] bg-slate-50 font-poppins overflow-hidden">
      <ChatHeader
        activeAduan={activeAduan}
        isCreatingNew={isCreatingNew}
        onGoBack={() => router.back()}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ChatList
          aduanList={aduanList}
          activeAduan={activeAduan}
          isCreatingNew={isCreatingNew}
          loading={loading}
          onStartNew={startNewAduan}
          onOpenThread={openThread}
        />

        <ChatThread
          activeAduan={activeAduan}
          isCreatingNew={isCreatingNew}
          inputValue={inputValue}
          sending={sending}
          messagesEndRef={messagesEndRef}
          onBackToList={goBackToList}
          onInputValueChange={setInputValue}
          onSendMessage={handleSendMessage}
        />
      </div>

      {errorMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-3 font-bold">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
