import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-replies`;

export default function AIReplySelector({ threadId, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const generateReplies = async () => {
    try {
      setLoading(true);
      setSelectedIndex(null);
      setReplies([]);

      const { data } = await axios.post(API_URL, {
        threadId: threadId,
      });

      setReplies(data.replies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReplies();
  }, []);

  const selectReply = (index) => {
    setSelectedIndex(index);
    onSelect(replies[index].content);
  };

  return (
    <div className="absolute top-0 left-full ml-5 w-[30rem] h-full">
      {/* Card */}
      <div className="bg-white border rounded-xl shadow-lg h-full flex flex-col overflow-hidden">
        {/* Header (fixed height) */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Reply Suggestions
            </h3>
            <p className="text-xs text-gray-500">
              Select one to insert into reply
            </p>
          </div>

          {loading && (
            <span className="text-xs text-blue-600 font-medium animate-pulse">
              Generating…
            </span>
          )}

          {!loading && (
           <button disabled={loading} className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors duration-200">
  Generate
</button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Skeleton Loading */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
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

          {/* Replies */}
          {!loading &&
            replies.map((r, i) => (
              <div
                key={i}
                onClick={() => selectReply(i)}
                className={`group p-4 border rounded-lg cursor-pointer transition-all
                  ${
                    selectedIndex === i
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                      : "hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {/* {r.option} */}
                    Reply {i + 1}
                  </span>

                  {selectedIndex === i && (
                    <span className="text-xs text-blue-600 font-medium">
                      Selected
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-4" dangerouslySetInnerHTML={{__html: r.content}}>
                   
                </div>
              </div>
            ))}

          {/* Empty State */}
          {!loading && replies.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">
              No suggestions available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
