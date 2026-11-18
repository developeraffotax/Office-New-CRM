import { useEffect, useRef } from "react";
import Message from "./Message.jsx";
import EmptyState from "./EmptyState.jsx";

export default function MessageList({ messages, suggestions, onPick }) {
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
        {messages.length === 0 ? (
          <EmptyState suggestions={suggestions} onPick={onPick} />
        ) : (
          messages.map((m, i) => <Message key={i} m={m} />)
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
