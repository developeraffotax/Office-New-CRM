// One chat for everyone. Streams answers over SSE and shows: sources, tool progress,
// a draft form the person reviews and submits, and confirm/cancel cards for proposed changes.
// Stack: React, Tailwind, axios, react-hot-toast. Auth: see aiApi.js (getToken).
//
// Layout only. State and streaming live in chat/hooks/useAgentChat.js, pieces in chat/components/.
import useAgentChat from "./chat/hooks/useAgentChat.js";
import { DEFAULT_SUGGESTIONS } from "./chat/constants.js";
import MessageList from "./chat/components/MessageList.jsx";
import Composer from "./chat/components/Composer.jsx";

export default function AgentChat({ suggestions = DEFAULT_SUGGESTIONS }) {
  const chat = useAgentChat();

  return (
    <div className="flex h-full min-h-[500px] flex-col bg-[#faf9f7] font-inter">
      <MessageList messages={chat.messages} suggestions={suggestions} onPick={chat.send} />
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
  );
}
