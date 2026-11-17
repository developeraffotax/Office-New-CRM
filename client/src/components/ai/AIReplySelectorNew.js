import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  HiArrowPath,
  HiOutlineDocumentDuplicate,
  HiCheckCircle,
  HiXMark,
} from "react-icons/hi2";
import { RiRobot2Line } from "react-icons/ri";
import { BsFillReplyAllFill } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import AiProjectManager from "./AiProjects/AiProjectManager";
import { IoBookmarkOutline } from "react-icons/io5";
import { HiOutlineDocumentText, HiOutlineDocument } from "react-icons/hi2";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-replies`;
const STORAGE_KEY = "ai_selected_project";

// Skeleton Component
const SkeletonCard = () => (
  <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 bg-white/50 animate-pulse">
    <div className="h-3 w-16 bg-slate-300 rounded mb-3"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-300 rounded w-full"></div>
      <div className="h-3 bg-slate-300 rounded w-[90%]"></div>
      <div className="h-3 bg-slate-300 rounded w-[75%]"></div>
      <div className="h-3 bg-slate-300 rounded w-[85%]"></div>
      <div className="h-3 bg-slate-300 rounded w-[60%]"></div>
    </div>
  </div>
);

export default function AIReplySelector({ threadId, onSelect, companyName }) {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [showPrompt, setShowPrompt] = useState(true);
  const [replyType, setReplyType] = useState("brief"); // "brief" | "comprehensive"

  const [project, setProject] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `${STORAGE_KEY}-${companyName.toLowerCase()}`
      );
      return saved
        ? JSON.parse(saved)
        : { _id: "", name: "", companyName: "" };
    } catch {
      return { _id: "", name: "", companyName: "" };
    }
  });

  const abortControllerRef = useRef(null);

  const generateReplies = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setSelectedIndex(null);
    setReplies([]);

    // Only one option based on the selected type
    const options = replyType === "brief" ? [2] : [4];

    let completedCount = 0;

    options.forEach(async (option) => {
      try {
        const { data } = await axios.post(
          API_URL,
          {
            threadId,
            customInstructions: customInstructions.trim() || undefined,
            projectId: project?._id,
            companyName: companyName?.toLowerCase(),
            optionNumber: option,
          },
          { signal: controller.signal }
        );

        if (!controller.signal.aborted) {
          setReplies((prev) => [...prev, data.reply]);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(`Failed to generate Option ${option}`, err);
        }
      } finally {
        completedCount += 1;
        if (completedCount === options.length && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    });
  }, [threadId, project?._id, companyName, customInstructions, replyType]);

  // Regenerate when thread / project / company / replyType changes
  useEffect(() => {
    generateReplies();
    return () => abortControllerRef.current?.abort();
  }, [threadId, project?._id, companyName, replyType]);

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    const formattedText = text
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    navigator.clipboard.writeText(formattedText);
    toast.success("Copied to clipboard", { id: "copy-toast" });
  };

  const handleUnlinkProject = (e) => {
    e.stopPropagation();
    const emptyProject = { _id: "", name: "", companyName: "" };
    setProject(emptyProject);
    localStorage.removeItem(
      `${STORAGE_KEY}-${companyName.toLowerCase()}`
    );
  };

  const handleTypeChange = (type) => {
    if (type === replyType) return;
    setReplyType(type);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-500">
              <BsFillReplyAllFill className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="font-bold text-slate-700">Suggestions</span>
              <span className="text-slate-300">/</span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowProjectsModal(true)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all max-w-[120px] ${
                    project._id
                      ? "border-orange-100 bg-orange-50/50 text-orange-700"
                      : "border-slate-100 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium truncate">
                    {project?.name || "Project"}
                  </span>
                  {!project._id && (
                    <IoBookmarkOutline className="w-3 h-3 text-slate-400" />
                  )}
                </button>
                {project._id && (
                  <button
                    onClick={handleUnlinkProject}
                    className="p-0.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded"
                  >
                    <HiXMark className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1">
            {/* Brief / Comprehensive Toggle */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 mr-1">
              <button
                onClick={() => handleTypeChange("brief")}
                title="Brief"
                className={`p-1.5 rounded transition-all ${
                  replyType === "brief"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <HiOutlineDocument className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleTypeChange("comprehensive")}
                title="Comprehensive"
                className={`p-1.5 rounded transition-all ${
                  replyType === "comprehensive"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <HiOutlineDocumentText className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

            <button
              onClick={() => setShowPrompt((v) => !v)}
              className={`p-1.5 rounded-md ${
                showPrompt
                  ? "text-orange-500 bg-orange-50"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
              title="Custom instructions"
            >
              <CiEdit className="w-4 h-4" />
            </button>

            <button
              onClick={generateReplies}
              disabled={loading}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              title="Regenerate"
            >
              <HiArrowPath
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {showPrompt && (
          <div className="px-5 py-3 border-b border-slate-200">
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!customInstructions?.trim()) return;
                  generateReplies();
                }
              }}
              placeholder="Press ENTER to regenerate..."
              className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              rows={3}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-3">
          <div className="space-y-3">
            {/* Single Reply Card */}
            {replies.map((r, i) => {
              const isSelected = selectedIndex === i;

              // console.log("Reply content:", r.content); // Debugging line
              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedIndex(i);
                    onSelect(r.content);
                  }}
                  className={`group relative p-4 rounded-lg cursor-pointer transition-all border animate-pop shadow-sm ${
                    isSelected
                      ? "bg-orange-50/40 border-orange-500 ring-1 ring-orange-500/20 shadow-orange-500/5"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {replyType === "brief" ? "Brief" : "Comprehensive"}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-orange-600 text-[10px] font-semibold">
                          <HiCheckCircle className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => copyToClipboard(e, r.content)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-orange-600 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <HiOutlineDocumentDuplicate className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Full visible text – no line-clamp */}
                 <div
                    className="text-sm text-slate-700 leading-snug prose prose-sm max-w-none
                              prose-p:my-0.5 prose-p:leading-snug"
                    dangerouslySetInnerHTML={{ __html: r.content }}
                  />
                </div>
              );
            })}

            {/* Skeleton while loading */}
            {loading && replies.length === 0 && <SkeletonCard />}

            {/* Empty State */}
            {!loading && replies.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <RiRobot2Line className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-sm text-slate-500">No suggestions yet</p>
                <button
                  onClick={generateReplies}
                  className="text-orange-500 text-sm font-semibold mt-2"
                >
                  Generate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProjectsModal && (
        <AiProjectManager
          companyName={companyName.toLowerCase()}
          onClose={() => setShowProjectsModal(false)}
          onSelect={(p) => {
            setProject(p);
            localStorage.setItem(
              `${STORAGE_KEY}-${companyName.toLowerCase()}`,
              JSON.stringify(p)
            );
            setShowProjectsModal(false);
          }}
          project={project}
        />
      )}
    </div>
  );
}