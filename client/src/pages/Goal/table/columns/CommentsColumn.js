import React, { useEffect, useState } from "react";
import { MdInsertComment } from "react-icons/md";

export const createCommentsColumn = ({ auth, setCommentTaskId, setIsComment }) => ({
  accessorKey: "comments",
  header: "Comments",
  Cell: ({ cell, row }) => {
    const comments = cell.getValue();
    const [readComments, setReadComments] = useState([]);

    useEffect(() => {
      const filterComments = comments?.filter(
        (item) => item.status === "unread" && item?.mentionUser === auth?.user?.name
      );
      setReadComments(filterComments);
      // eslint-disable-next-line
    }, [comments]);

    return (
      <div
        className="flex items-center justify-center gap-1 relative w-full h-full"
        onClick={() => {
          setCommentTaskId(row.original._id);
          setIsComment(true);
        }}
      >
        <div className="relative">
          <span className="text-[1rem] cursor-pointer relative">
            <MdInsertComment className="h-5 w-5 text-orange-600 " />
          </span>
          {readComments?.length > 0 && (
            <span className="absolute -top-3 -right-3 bg-green-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
              {readComments?.length}
            </span>
          )}
        </div>
      </div>
    );
  },
  size: 90,
});

export default createCommentsColumn;


