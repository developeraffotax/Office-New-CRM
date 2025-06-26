import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const DraggableUserList = ({table, usersArray, dataArr, listName, filterColName = "jobHolder", getJobHolderCountFn }) => {
   
    const [userNameArray, setUserNameArray] = useState(usersArray);
    const [active, setActive] = useState("")



  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };



  //  -----------Handle drag end---------
  const handleUserOnDragEnd = (result) => {
    const items = reorder(
      userNameArray,
      result.source.index,
      result.destination.index
    );
    localStorage.setItem(`${listName}_usernamesOrder`, JSON.stringify(items));
    setUserNameArray(items);
  };



  // --------------Job_Holder Length---------->

//   const getJobHolderCount = (userName, status) => {
//     console.log(" DATA ARRAY 💛💛💛", dataArr);
//     if (userName === "All") {
//       return dataArr?.length
//     }
//     return dataArr.filter(
//       (el) => el?.jobHolder === userName
//     )?.length;
//   };



  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);
    return col.setFilterValue(filterVal);
  };














  return (
    <>
      <div className="w-full  py-2 ">
        <div className="flex items-center flex-wrap gap-4">
          <DragDropContext onDragEnd={handleUserOnDragEnd}>
            <Droppable droppableId="users0" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex items-center gap-3 overflow-x-auto hidden1"
                >
                  <div
                    className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                      active === "All" &&
                      "  border-b-2 text-orange-600 border-orange-600"
                    }`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => {
                      setActive("All");
                      setColumnFromOutsideTable(filterColName, "");
                    }}
                  >
                    All ( {getJobHolderCountFn && getJobHolderCountFn("All")})
                  </div>

                  {userNameArray.map((userName, index) => {
                    console.log("THE USER IS", userName);

                    return (
                      <Draggable key={userName} draggableId={userName} index={index}>
                        {(provided) => (
                          <div
                            className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                              active === userName &&
                              "  border-b-2 text-orange-600 border-orange-600"
                            }`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setActive(userName);
                              setColumnFromOutsideTable(filterColName, userName);
                            }}
                          >
                            {userName} ( {getJobHolderCountFn && getJobHolderCountFn(userName)})
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
    </>
  );
};

export default DraggableUserList;
