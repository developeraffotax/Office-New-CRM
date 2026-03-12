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

  const generateReplies = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      setLoading(true);
      setSelectedIndex(null);
      const { data } = await axios.post(
        API_URL,
        {
          threadId,
          customInstructions: customInstructions.trim() || undefined,
          projectId: project?._id,
          companyName: companyName?.toLowerCase(),
        },
        { signal: controller.signal },
      );
      setReplies(data.replies || []);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Previous request aborted.");
        return;
      }

      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Generation failed. Please try again.",
      );
      console.log(err);
    } finally {
      if (controller === abortControllerRef.current) {
        setLoading(false);
      }
    }
  };

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
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg space-y-2 animate-pulse"
                >
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  <div className="h-3 w-4/6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((r, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedIndex(i);
                    onSelect(r.content);
                  }}
                  className={`
                    group relative p-4 rounded-lg cursor-pointer transition-all border-2
                    ${
                      selectedIndex === i
                        ? "bg-gray-50 border-orange-500 shadow-lg "
                        : "bg-gray-50 border-transparent hover:shadow-md"
                    }
                  `}
                >
                  {/* Top-left Selected Badge */}
                  {selectedIndex === i && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
                      <HiCheckCircle className="w-3 h-3" />
                      Selected
                    </div>
                  )}

                  <div className="flex justify-start items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Reply {i + 1}
                    </span>
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyToClipboard(e, r.content)}
                        className="p-1 hover:text-orange-500 text-slate-400 transition-colors"
                        title="Copy text"
                      >
                        <HiOutlineDocumentDuplicate className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="text-sm text-slate-700 line-clamp-6"
                    dangerouslySetInnerHTML={{ __html: r.content }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <RiRobot2Line className="w-14 h-14 text-slate-200 mb-2" />
              <p className="text-sm font-medium text-slate-500">
                No suggestions generated
              </p>
              <button
                onClick={generateReplies}
                className="mt-2 text-sm text-orange-500 font-semibold hover:underline"
              >
                Click to retry
              </button>
            </div>
          )}
        </div>
      </div>

      

      {
              showProjectsModal && <AiProjectManager companyName={companyName.toLowerCase()} onClose={() => setShowProjectsModal(false)} onSelect={(project) => {setProject(project)}} project={project}/>
            }
    </div>
  );
}
