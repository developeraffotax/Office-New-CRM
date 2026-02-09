import { useEffect, useState } from "react";
import { FiX, FiMessageCircle, FiLoader } from "react-icons/fi";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import axios from "axios";

export default function CommentList({ threadId, currentUserId, onClose, users }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("USERS", users)
  // Trigger fetch when threadId changes
  useEffect(() => {
    if (threadId) fetchComments();
  }, [threadId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/gmail/comments/${threadId}`);
      if (res?.data?.data) {
  setComments(res.data.data);
}
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleAddComment = async (data) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/gmail/comments`, data);
      fetchComments();
    } catch (err) { console.error(err); }
  };

  if (!threadId) return null; // Hidden if no thread is selected

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background Dimmer (optional, remove for "non-modal" feel) */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />

      {/* The Modern Pop-up Window */}
      <div className="absolute bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-300">
        
        {/* Header: Professional & Clean */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FiMessageCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Thread Discussion</h3>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {threadId.slice(-8)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <FiLoader className="animate-spin" size={24} />
              <p className="text-xs">Syncing messages...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <FiMessageCircle size={32} />
              </div>
              <h4 className="text-slate-800 font-semibold text-sm">No internal notes</h4>
              <p className="text-slate-400 text-xs mt-1">Comments are only visible to your team.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                currentUserId={currentUserId} 
                onDelete={() => {/* Your delete logic */}} 
              />
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <CommentForm threadId={threadId} onAddComment={handleAddComment} loading={loading} users={users}/>
        </div>
      </div>
    </div>
  );
}