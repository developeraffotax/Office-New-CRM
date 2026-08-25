import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdInsertLink,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatClear,
} from "react-icons/md";
import ToolbarButton from "./ToolbarButton";

/**
 * Each entry maps to a document.execCommand, except "link" which needs the
 * window.prompt flow. Add a new formatting button by adding a row here —
 * no JSX changes needed anywhere else.
 */
const TOOLBAR_GROUPS = [
  [
    { command: "bold", label: "Bold", Icon: MdFormatBold },
    { command: "italic", label: "Italic", Icon: MdFormatItalic },
    { command: "underline", label: "Underline", Icon: MdFormatUnderlined },
  ],
  [
    { id: "link", label: "Insert link", Icon: MdInsertLink },
    { command: "insertUnorderedList", label: "Bulleted list", Icon: MdFormatListBulleted },
    { command: "insertOrderedList", label: "Numbered list", Icon: MdFormatListNumbered },
  ],
  [{ command: "removeFormat", label: "Clear formatting", Icon: MdFormatClear }],
];

export default function FormattingToolbar({ onExec, onInsertLink }) {
  return (
    <div className="shrink-0 flex items-center gap-0.5 px-3 py-1.5 border-t border-gray-100 text-gray-600">
      {TOOLBAR_GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <div className="w-px h-4 bg-gray-200 mx-1" />}
          {group.map(({ command, id, label, Icon }) => (
            <ToolbarButton
              key={label}
              label={label}
              onClick={id === "link" ? onInsertLink : () => onExec(command)}
            >
              <Icon size={15} />
            </ToolbarButton>
          ))}
        </div>
      ))}
    </div>
  );
}
