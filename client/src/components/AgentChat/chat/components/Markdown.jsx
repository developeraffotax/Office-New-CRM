import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Styled elements for assistant answers. Raw HTML in the text is NOT rendered (react-markdown default).
const el = (Tag, cls) =>
  function Element({ node, className, ...props }) {
    return <Tag className={cls} {...props} />;
  };

const components = {
  p: el("p", "my-3 first:mt-0 last:mb-0"),
  strong: el("strong", "font-semibold text-gray-900"),
  em: el("em", "italic"),
  h1: el("h1", "mb-2 mt-5 text-xl font-semibold tracking-tight text-gray-900 first:mt-0"),
  h2: el("h2", "mb-2 mt-5 text-lg font-semibold tracking-tight text-gray-900 first:mt-0"),
  h3: el("h3", "mb-1.5 mt-4 text-base font-semibold text-gray-900 first:mt-0"),
  h4: el("h4", "mb-1 mt-3 text-sm font-semibold text-gray-900 first:mt-0"),
  ul: el("ul", "my-3 list-disc space-y-1.5 pl-6 marker:text-gray-400"),
  ol: el("ol", "my-3 list-decimal space-y-1.5 pl-6 marker:text-gray-500"),
  li: el("li", "pl-1"),
  hr: el("hr", "my-5 border-gray-200"),
  blockquote: el("blockquote", "my-3 border-l-4 border-orange-200 pl-4 text-gray-600"),
  pre: el("pre", "my-3 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm leading-6 text-gray-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"),
  code: el("code", "rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] text-gray-800"),
  a: ({ node, className, ...props }) => (
    <a className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node, className, ...props }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: el("thead", "bg-gray-50 text-gray-700"),
  th: el("th", "border-b border-gray-200 px-3 py-2 font-semibold"),
  td: el("td", "border-t border-gray-100 px-3 py-2 align-top"),
};

export default function Markdown({ children }) {
  return (
    <div className="text-[15px] leading-7 text-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
