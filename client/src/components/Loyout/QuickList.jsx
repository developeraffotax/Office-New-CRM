import Draggable from "react-draggable";
import { CgList } from "react-icons/cg";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useClickOutside } from "../../utlis/useClickOutside";
import { useRef } from "react";
import { useEscapeKey } from "../../utlis/useEscapeKey";

export const QuickList = ({
  setShowQuickList,
  quickListData,
  setQuickListData,
  updateQuickList,
}) => {
  const ref = useRef();

  useClickOutside(ref, () => setShowQuickList(false));
  useEscapeKey(() => setShowQuickList(false));

  
  return (
    <div ref={ref}>
      <Draggable handle=".drag-handle">
        <div className="fixed top-[4rem] right-[8rem] z-[999] w-[29rem] bg-gray-50 rounded-md shadow-md">
          <div className="drag-handle flex justify-between bg-orange-600 text-white p-3 cursor-move">
            <h5 className="flex items-center gap-2 text-lg">
              <CgList /> Quick Lists
            </h5>
            <IoCloseCircleOutline
              size={26}
              onClick={() => setShowQuickList(false)}
            />
          </div>

          <textarea
            className="w-full h-[16rem] p-3 bg-transparent outline-none resize-none"
            value={quickListData}
            onChange={(e) => setQuickListData(e.target.value)}
            onBlur={updateQuickList}
            placeholder="Add quick list here..."
          />
        </div>
      </Draggable>
    </div>
  );
};
