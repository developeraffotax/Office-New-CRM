// One chat for everyone. Streams answers over SSE and shows: sources, tool progress,
// a draft form the person reviews and submits, and confirm/cancel cards for proposed changes.
// Saved chats are listed in the left column; the server keeps each chat's history.
// Stack: React, Tailwind, axios, react-hot-toast. Auth: see aiApi.js (getToken).
//
// Layout only. State and streaming live in chat/hooks/useAgentChat.js, pieces in chat/components/.
import { useState } from "react";
import useAgentChat from "./chat/hooks/useAgentChat.js";
import { DEFAULT_SUGGESTIONS } from "./chat/constants.js";
import HistorySidebar from "./chat/components/HistorySidebar.jsx";
import MessageList from "./chat/components/MessageList.jsx";
import Composer from "./chat/components/Composer.jsx";
import { MenuIcon } from "./shared/ui/Icons.jsx";

export default function AgentChat({ suggestions = DEFAULT_SUGGESTIONS }) {
  const chat = useAgentChat();
  const [historyOpen, setHistoryOpen] = useState(false); // small screens only
  const close = () => setHistoryOpen(false);
  const title = chat.conversations.find((c) => c.id === chat.conversationId)?.title ?? "New chat";

  return (
    <div className="relative flex h-full min-h-[500px] bg-[#faf9f7] font-inter">
      <HistorySidebar
        conversations={chat.conversations}
        activeId={chat.conversationId}
        loading={chat.loadingList}
        busy={chat.busy}
        open={historyOpen}
        onClose={close}
        onNew={() => { chat.newChat(); close(); }}
        onOpen={(id) => { chat.openConversation(id); close(); }}
        onDelete={chat.removeConversation}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white/80 px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open chat history"
            className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="truncate text-sm font-medium text-gray-700">{title}</span>
        </div>

        <MessageList messages={chat.messages} suggestions={suggestions} onPick={chat.send} name={chat.me?.name} />
        <Composer
          input={chat.input}
          onInput={chat.setInput}
          onSend={chat.send}
          busy={chat.busy}
          onStop={chat.stop}
          attachments={chat.attachments}
          onRemoveAttachment={chat.removeAttachment}
          uploading={chat.uploading}
          fileRef={chat.fileRef}
          onAttach={chat.attach}
        />
      </div>
    </div>
  );
}