import AssistantMessage from "./AssistantMessage.jsx";

export default function Message({ m }) {
  if (m.role === "user")
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-orange-500 px-4 py-2.5 text-[15px] leading-6 text-white shadow-sm sm:max-w-[75%]">
          {m.content}
        </div>
      </div>
    );
  return <AssistantMessage m={m} />;
}
