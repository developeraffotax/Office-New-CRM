// ui/MatchBadge.jsx
import { FiMessageSquare, FiUser } from "react-icons/fi";
import clsx from "clsx";

const CONFIG = {
  messages: {
    label: "Found in messages",
    title: "Your search matched text inside the email messages",
    className: "bg-blue-100 text-blue-700",
    Icon: FiMessageSquare,
  },
  details: {
    label: "Found in subject / sender",
    title: "Your search matched the subject, sender or reference",
    className: "bg-orange-100 text-orange-600",
    Icon: FiUser,
  },
  both: {
    label: "Found in messages & subject",
    title: "Matched in the subject/sender and inside the messages",
    className: "bg-blue-100 text-blue-700",
    Icon: FiMessageSquare,
  },
};

export default function MatchBadge({ matchedIn }) {
  const cfg = CONFIG[matchedIn];
  if (!cfg) return null;

  const { Icon } = cfg;
  return (
    <span
      title={cfg.title}
      className={clsx(
        "inline-flex items-center gap-1 text-[11px] font-semibold font-inter uppercase tracking-wider px-2 py-1  ",
        cfg.className,
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}