
import AssistantMessage from "./AssistantMessage.jsx";
import CopyButton from "./CopyButton.jsx";
import { FileIcon } from "../../shared/ui/Icons.jsx";

export default function Message({ m }) {
  if (m.role === "user")
    return (
      <div className="flex flex-col items-end gap-1.5">
        {m.attachments?.length > 0 && (
          <div className="flex max-w-[85%] flex-wrap justify-end gap-1.5 sm:max-w-[75%]">
            {m.attachments.map((a, i) => (
              <span
                key={i}
                className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-900"
              >
                <FileIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                <span className="truncate">{a.filename}</span>
              </span>
            ))}
          </div>
        )}

        <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-orange-500 px-4 py-2.5 text-[15px] leading-6 text-white shadow-sm sm:max-w-[75%]">
          {m.content}
        </div>

        <div className="flex w-[85%] justify-end sm:w-[75%]">
          <CopyButton text={m.content} align="right" />
        </div>
      </div>
    );

  return <AssistantMessage m={m} />;
}
