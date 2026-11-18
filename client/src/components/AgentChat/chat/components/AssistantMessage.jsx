import Avatar from "../../shared/ui/Avatar.jsx";
import { AlertIcon } from "../../shared/ui/Icons.jsx";
import ToolProgress from "./ToolProgress.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import DraftForm from "./DraftForm.jsx";
import FileCard from "./FileCard.jsx";
import ProposalCard from "./ProposalCard.jsx";
import SourceList from "./SourceList.jsx";
import Markdown from "./Markdown.jsx";

export default function AssistantMessage({ m }) {
  const running = (m.tools || []).filter((t) => t.status === "start");
  const streaming = !m.done && !m.error;
  const hasOutput = Boolean(m.content || m.error || m.draft || m.files?.length || m.proposals?.length);
  // Nothing to show yet and no tool is running: the model is thinking.
  const thinking = streaming && !hasOutput && running.length === 0;

  return (
    <div className="flex gap-3">
      <Avatar pulse={thinking} />
      <div className="min-w-0 max-w-[calc(100%-2.75rem)] flex-1">
        <ToolProgress tools={running} />
        {thinking && <TypingIndicator />}

        {m.error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="whitespace-pre-wrap">{m.error}</span>
          </div>
        ) : (
          m.content && (
            <div>
              <Markdown>{m.content}</Markdown>
              {streaming && <span className="mt-1 inline-block h-2 w-2 animate-pulse rounded-full bg-orange-500" aria-hidden="true" />}
            </div>
          )
        )}

        {m.draft && <DraftForm draft={m.draft} />}
        {m.files?.map((f) => <FileCard key={f.id} file={f} />)}
        {m.proposals?.map((p) => <ProposalCard key={p.id} proposal={p} />)}
        {m.sources?.length > 0 && m.done && <SourceList sources={m.sources} />}
      </div>
    </div>
  );
}
