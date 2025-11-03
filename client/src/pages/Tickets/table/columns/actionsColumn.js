import { useEffect, useState } from "react";
 
import { AiTwotoneDelete } from "react-icons/ai";
import { MdCheckCircle, MdInsertComment, MdRemoveRedEye } from "react-icons/md";
import { TbLogs } from "react-icons/tb";

export const actionsColumn = (ctx) => {


    return            {
            accessorKey: "actions",
            header: "Actions",
            Cell: ({ cell, row }) => {
              const comments = row.original?.comments;
              const [readComments, setReadComments] = useState([]);
    
              useEffect(() => {
                const filterComments = comments.filter(
                  (item) => item.status === "unread"
                );
                setReadComments(filterComments);
                // eslint-disable-next-line
              }, [comments]);
    
              console.log("REaD COMMENTS", comments);
    
              return (
                <div className="flex items-center justify-center gap-4 w-full h-full">
    
    
    
                     <span
                    className=""
                    title="View Ticket"
                    onClick={() => {
                      ctx.toggleDrawer(true);
                      ctx.setTicketId(row.original._id)
                      
                    }}
                  >
                    
                    <MdRemoveRedEye className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-600" />
                  </span>
    
                  
    
    
                     {/* <span
                    className=""
                    title="View Logs"
                    onClick={() => {
                      ctx.setIsActivityDrawerOpen(true);
                      ctx.setActivityDrawerTicketId(row.original._id);
                    }}
                  >
                    <TbLogs className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-600" />
                  </span> */}
    
    
    
                    <div
                      className="flex items-center justify-center gap-1 relative w-full h-full"
                      onClick={() => {
                        ctx.setCommentTicketId(row.original._id);
                        ctx.setIsComment(true);
                      }}
                    >
                      <div className="relative">
                        <span className="text-[1rem] cursor-pointer relative">
                          <MdInsertComment className={`h-5 w-5 text-orange-600 `} />
                        </span>
                      </div>
                    </div>
    
                  <span
                    className=""
                    title="Complete Ticket"
                    onClick={() => {
                      ctx.handleUpdateTicketStatusConfirmation(row.original._id);
                    }}
                  >
                    <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
                  </span>
                  <span
                    className="text-[1rem] cursor-pointer"
                    onClick={() => ctx.handleDeleteTicketConfirmation(row.original._id)}
                    title="Delete Ticket!"
                  >
                    <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
                  </span>
                </div>
              );
            },
            size: 150,
          }
}