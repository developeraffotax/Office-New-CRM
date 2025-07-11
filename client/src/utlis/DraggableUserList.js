import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const DraggableUserList = ({
  table,
  usersArray,
  listName,
  filterColName = "jobHolder",
  updateJobHolderCountMapFn,
  setColumnFromOutsideTableFn,
}) => {
  const [userNameArray, setUserNameArray] = useState(usersArray);
  const [active, setActive] = useState("All");

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  console.log("USER💚💛💛🧡🧡❤❤", usersArray);

  function mergeWithSavedOrder(fetchedUsernames, savedOrder) {
    const savedSet = new Set(savedOrder);
    console.log("savedSET>>>>", savedSet);
    // Preserve the order from savedOrder, but only if the username still exists in the fetched data
    const ordered = savedOrder.filter((name) =>
      fetchedUsernames.includes(name)
    );

    // Add any new usernames that aren't in the saved order
    const newOnes = fetchedUsernames.filter((name) => !savedSet.has(name));

    return [...ordered, ...newOnes];
  }

  const handleUserOnDragEnd = (result) => {
    if (!result || !result.source?.index || !result.destination?.index) {
      return;
    }
    const items = reorder(
      userNameArray,
      result.source.index,
      result.destination.index
    );
    localStorage.setItem(`${listName}_usernamesOrder`, JSON.stringify(items));
    setUserNameArray(items);
  };

  const jobHolderCountMap = useMemo(() => {
    const map = new Map();
    let totalCount = 0;

    if (updateJobHolderCountMapFn) {
      updateJobHolderCountMapFn(map, totalCount);
    }

    return map;
  }, [updateJobHolderCountMapFn]);

  const getJobHolderCount = (userName) => {
    console.log("THE MAP IS 💚💜💙💙💚💚💛💛🧡🧡", jobHolderCountMap);
    return jobHolderCountMap.get(userName) || 0;
  };

  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);

    console.log("WELL THE COLUMN IS💚💛", col);
    return col.setFilterValue(filterVal);
  };

  useEffect(() => {
    const savedOrder = JSON.parse(
      localStorage.getItem(`${listName}_usernamesOrder`)
    );
    if (savedOrder) {
      const savedUserNames = mergeWithSavedOrder(usersArray, savedOrder);

      setUserNameArray(savedUserNames);
    } else {
      setUserNameArray(usersArray);
    }
  }, [listName, usersArray]);

  useEffect(() => {
    const col = table.getColumn(filterColName);
    const filterVal = col.getFilterValue();
    if (filterVal) {
      setActive(filterVal);
    } else {
      setActive("All")
    }
  }, [filterColName, table, usersArray]);

  return (
    <>
      <div className="w-full ">
        <div className="flex items-center flex-wrap gap-2">
          <DragDropContext onDragEnd={handleUserOnDragEnd}>
            <Droppable droppableId="users0" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar px-2"
                >
                  {/* All Tab */}
                  <div
                    className={`p-1 text-sm font-medium cursor-pointer transition-all duration-150 ${
                      active === "All"
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-gray-800"
                    }`}
                    onClick={() => {
                      setActive("All");
                      (
                        setColumnFromOutsideTableFn ?? setColumnFromOutsideTable
                      )(filterColName, "");
                    }}
                  >
                    All{" "}
                    {updateJobHolderCountMapFn &&
                      ` (${getJobHolderCount("All")})`}
                  </div>

                  {/* User Tabs */}
                  {userNameArray.map((userName, index) => (
                    <Draggable
                      key={userName}
                      draggableId={userName}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={` p-1  text-nowrap  text-sm font-medium cursor-pointer transition-all duration-150 ${
                            active === userName
                              ? "  text-orange-500 border-b-2 border-orange-500 "
                              : "  text-gray-800"
                          }`}
                          onClick={() => {
                            setActive(userName);
                            (
                              setColumnFromOutsideTableFn ??
                              setColumnFromOutsideTable
                            )(filterColName, userName);
                          }}
                        >
                          {userName}
                          {updateJobHolderCountMapFn &&
                            ` (${getJobHolderCount(userName)})`}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </>
  );
};

export default DraggableUserList;

















//   return (
//     <>
//       <div className="w-full  py-2 ">
//         <div className="flex items-center flex-wrap gap-4">
//           <DragDropContext onDragEnd={handleUserOnDragEnd}>
//             <Droppable droppableId="users0" direction="horizontal">
//               {(provided) => (
//                 <div
//                   {...provided.droppableProps}
//                   ref={provided.innerRef}
//                   className="flex items-center gap-3 overflow-x-auto hidden1"
//                 >
//                   <div
//                     className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
//                       active === "All" &&
//                       "  border-b-2 text-orange-600 border-orange-600"
//                     }`}
//                     ref={provided.innerRef}
//                     {...provided.draggableProps}
//                     {...provided.dragHandleProps}
//                     onClick={() => {
//                       setActive("All");
//                       setColumnFromOutsideTable(filterColName, "");
//                     }}
//                   >
//                     All ( {getJobHolderCount("All")})
//                   </div>

//                   {userNameArray.map((userName, index) => {
//                     console.log("THE USER IS", userName);

//                     return (
//                       <Draggable key={userName} draggableId={userName} index={index}>
//                         {(provided) => (
//                           <div
//                             className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
//                               active === userName &&
//                               "  border-b-2 text-orange-600 border-orange-600"
//                             }`}
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             onClick={() => {
//                               setActive(userName);
//                               setColumnFromOutsideTable(filterColName, userName);
//                             }}
//                           >
//                             {userName} ( {getJobHolderCount(userName)})
//                           </div>
//                         )}
//                       </Draggable>
//                     );
//                   })}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>
//         </div>
//       </div>

//     </>
//   );
