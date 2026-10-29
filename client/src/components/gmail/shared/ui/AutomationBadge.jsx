// mail/shared/ui/AutomationBadge.js
import clsx from "clsx";
import { FiAlertTriangle, FiClock, FiPause, FiZap } from "react-icons/fi";

const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

const STYLES = {
  active: { Icon: FiZap, cls: "bg-orange-50 text-orange-600 border-orange-200" },
  approval: { Icon: FiClock, cls: "bg-amber-50 text-amber-700 border-amber-300" },
  paused: { Icon: FiPause, cls: "bg-gray-100 text-gray-500 border-gray-200" },
  failed: { Icon: FiAlertTriangle, cls: "bg-red-50 text-red-600 border-red-200" },
};

function getLabel(a) {
  switch (a.state) {
    case "failed":
      return "Auto failed";
    case "approval":
      return `Approval${a.pending > 1 ? ` (${a.pending})` : ""}`;
    case "paused":
      return "Auto paused";
    default: // active
      if (a.autoReply && a.autoFollowUp) return "Reply + follow-up";
      if (a.autoReply) return "Auto-reply";
      return `Follow-up ${a.sentCount}/${a.maxFollowUps}`;
  }
}

function getDetails(a) {
  const lines = [];
  if (a.autoReply) lines.push(`Auto-reply: ${a.replyCount}/${a.maxAutoReplies} sent`);
  if (a.autoFollowUp) {
    lines.push(`Follow-up every ${a.frequencyDays}d: ${a.sentCount}/${a.maxFollowUps} sent`);
    lines.push(a.nextRunAt ? `Next follow-up: ${fmt(a.nextRunAt)}` : "Follow-up timer starts after our next message");
  }
  if (a.pending) lines.push(`${a.pending} draft${a.pending > 1 ? "s" : ""} awaiting admin approval`);
  if (a.state === "failed" && a.lastError) lines.push(`Error: ${a.lastError}`);
  return lines;
}

export default function AutomationBadge({ automation }) {
  const a = automation;
  const style = a && STYLES[a.state]; // "off" or missing automation has no style, so nothing renders
  if (!style) return null;

  const { Icon, cls } = style;

  return (
    <span
      title={getDetails(a).join("\n")}
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-medium",
        cls,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {getLabel(a)}
    </span>
  );
}