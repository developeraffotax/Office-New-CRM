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
import { FaReplyAll } from "react-icons/fa";
import { BsFillReplyAllFill } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import AiProjectManager from "./AiProjects/AiProjectManager";
import { IoBookmarkOutline } from "react-icons/io5";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-replies`;
const STORAGE_KEY = "ai_selected_project";

// Skeleton Component for "Loading Behind" effect
const SkeletonCard = () => (
  <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 bg-white/50 animate-pulse">
    <div className="h-3 w-16 bg-slate-300 rounded mb-3"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-300 rounded w-full"></div>
      <div className="h-3 bg-slate-300 rounded w-[90%]"></div>
      <div className="h-3 bg-slate-300 rounded w-[75%]"></div>
    </div>
  </div>
);



export default function AIReplySelector({ threadId, onSelect, companyName }) {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [customInstructions, setCustomInstructions] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const [project, setProject] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}-${companyName.toLowerCase()}`);
      return saved ? JSON.parse(saved) : { _id: "", name: "", companyName: "" };
    } catch {
      return { _id: "", name: "", companyName: "" };
    }
  });


 
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  const abortControllerRef = useRef(null);

  const generateReplies = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setSelectedIndex(null);
    setReplies([]); // We clear to start fresh suggestions

    const options = [1, 2, 3, 4];
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

        // Check if this request is still relevant (not aborted/overridden)
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
  }, [threadId, project?._id, companyName, customInstructions]);

  useEffect(() => {
    generateReplies();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [threadId, project]);

  const copyToClipboard = (e, text) => {
    e.stopPropagation();

    const formattedText = text
      // Paragraphs → double line break
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")

      // Line breaks
      .replace(/<br\s*\/?>/gi, "\n")

      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, "")

      // Cleanup extra spacing
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    navigator.clipboard.writeText(formattedText);
    toast.success("Copied to clipboard", { id: "copy-toast" });
  };


  
  // Add this handler inside your component
const handleUnlinkProject = (e) => {
  e.stopPropagation(); // Prevents opening the modal
  setProject({ _id: "", name: "" });
};



  return (
    <div className="absolute top-0 left-full ml-4 w-[450px] h-full   animate-fade-in duration-200 rounded-lg shadow-2xl overflow-hidden z-[50]">
      <div className="bg-white h-full flex flex-col    ">
        {/* Header */}
       <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
         {/* Left: Condensed Breadcrumb Style */}
         <div className="flex items-center gap-1.5 min-w-0">
           <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-500">
             <BsFillReplyAllFill className="w-3 h-3 text-white" />
           </div>
           
           <div className="flex items-center gap-1 text-xs">
             <span className="font-bold text-slate-700 whitespace-nowrap">Suggestions</span>
             <span className="text-slate-300">/</span>
             
             <div className="flex items-center gap-0.5 group">
               <button 
                 onClick={() => setShowProjectsModal(true)}
                 className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all max-w-[120px] ${
                   project._id 
                     ? "border-orange-100 bg-orange-50/50 text-orange-700 hover:border-orange-300" 
                     : "border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                 }`}
               >
                 <span className="font-medium truncate">{project?.name || "Project"}</span>
                 {!project._id && <IoBookmarkOutline className="w-3 h-3 text-slate-400" />}
               </button>
       
               {/* The Unlink Button - Only shows if project is selected */}
               {project._id && (
                 <button
                   onClick={handleUnlinkProject}
                   className="p-0.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded transition-colors"
                   title="Unlink project"
                 >
                   <HiXMark className="w-3.5 h-3.5" />
                 </button>
               )}
             </div>
           </div>
         </div>
       
         {/* Right Actions */}
         <div className="flex items-center gap-1 shrink-0">
           <button
             onClick={() => setShowPrompt((v) => !v)}
             className={`p-1.5 rounded-md transition-colors ${showPrompt ? 'text-orange-500 bg-orange-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
             title="Edit Instructions"
           >
             <CiEdit className="w-4 h-4" />
           </button>
       
           <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
       
           <button
             onClick={generateReplies}
             disabled={loading}
             className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-all disabled:opacity-50"
           >
             <HiArrowPath className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            
           </button>
         </div>
       </div>
       

        {showPrompt && (
          <div className="px-5 py-3 bg-white border-b border-slate-200">
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Optional: e.g. Keep it short and polite. Ask for missing documents."
              rows={3}
              className="
        w-full resize-none rounded-md border border-slate-300
        px-3 py-2 text-sm text-slate-700
        placeholder:text-slate-400
        focus:outline-none focus:ring-2 focus:ring-orange-400
      "
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Customize responses. Formatting rules stay unchanged.
            </p>
          </div>
        )}

        {/* Main Content */}
         <div className="flex-1 overflow-y-auto bg-slate-50/30 p-3">
          <div className="space-y-3">
            {/* Real Replies */}
            {replies.map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedIndex(i);
                  onSelect(r.content);
                }}
                className={`group relative p-4 rounded-lg cursor-pointer transition-all border-2 animate-pop shadow-md shadow-black/50${
                  selectedIndex === i ? "bg-white border-orange-500 shadow-md" : "bg-white   hover:border-slate-200"
                }`}
              >
                {selectedIndex === i && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <HiCheckCircle className="w-3 h-3" /> Selected
                  </div>
                )}
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Option {i + 1}</span>
                  <button onClick={(e) => copyToClipboard(e, r.content)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-orange-500">
                    <HiOutlineDocumentDuplicate className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-slate-700 line-clamp-6" dangerouslySetInnerHTML={{ __html: r.content }} />
              </div>
            ))}

            {/* Skeletons: Show while loading and while we have fewer than 4 replies */}
            {loading && Array.from({ length: 4 - replies.length }).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`} />
            ))}

            {/* Empty State */}
            {!loading && replies.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <RiRobot2Line className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-sm text-slate-500">No suggestions yet</p>
                <button onClick={generateReplies} className="text-orange-500 text-sm font-semibold mt-2">Generate</button>
              </div>
            )}
          </div>
        </div>
      </div>

      

      {
              showProjectsModal && <AiProjectManager companyName={companyName.toLowerCase()} onClose={() => setShowProjectsModal(false)} onSelect={(project) => {setProject(project)}} project={project}/>
            }
    </div>
  );
}
