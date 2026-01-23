import { useEffect, useState } from "react";
import axios from "axios";
import { RiLoaderFill } from "react-icons/ri";
import { IoCloseCircleOutline, IoCloseCircleSharp } from "react-icons/io5";

export const SubtaskListManager = ({ onApplyList, onClose }) => {
  const [lists, setLists] = useState([]);
  const [name, setName] = useState("");
  const [newItem, setNewItem] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);


 

  // ✅ Fetch existing lists
  useEffect(() => {
    const fetchLists = async () => {
      setIsFetching(true);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/subtask-lists`);
         
        if(data && data.success) {
           
           setLists(data.data);
        }

       
      } catch (error) {
        
        console.error("Error fetching subtask lists:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchLists();
  }, []);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { title: newItem }]);
    setNewItem("");
  };

  // ✅ Save new list
  const saveList = async (e) => {
    e.preventDefault();
    if (!name.trim() || items.length === 0) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/subtask-lists`, {
        name,
        items,
      });
      if(data && data.success) {
        setLists([data.data, ...lists]);
        setName("");
        setItems([]);
      }
    } catch (error) {
      console.error("Error saving list:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete list
  const deleteList = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/subtask-lists/${id}`);
      setLists(lists.filter((l) => l._id !== id));
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  return (
   <div className="w-full h-full flex items-center justify-center ">
    
      <div className="w-full max-w-lg max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-xl p-8 flex flex-col overflow-hidden relative">
        <span onClick={onClose} className="absolute top-3 right-3 cursor-pointer "><IoCloseCircleSharp className="w-6 h-6  text-gray-500 hover:text-red-500"/></span>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Subtask Templates
        </h2>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Create New Template */}
          <form onSubmit={saveList} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="List Name (e.g. Accounts)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm "
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Subtask title"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full  "
              />
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300"
              >
                Add
              </button>
            </div>

            {items.length > 0 && (
              <ul className="flex flex-col gap-1">
                {items.map((i, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 border rounded-md px-2 py-1 text-sm"
                  >
                    {i.title}
                    <IoCloseCircleOutline
                      className="cursor-pointer text-gray-500 hover:text-red-500"
                      onClick={() => setItems(items.filter((_, i2) => i2 !== idx))}
                    />
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              className="py-2 mt-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md flex justify-center items-center"
            >
              {loading ? <RiLoaderFill className="h-5 w-5 animate-spin" /> : "Save Template"}
            </button>
          </form>
            {
            isFetching ? (
              <div className="flex justify-center items-center h-32">
                <RiLoaderFill className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : lists.length === 0 ? (
              <p className="text-center text-gray-500 mt-6">No templates available.</p>
            ) : null
            }
          {/* Existing Templates */}
          <div className="flex flex-col gap-3">
            {lists.map((list) => (
              <div
                key={list._id}
                className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-gray-800">{list.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApplyList(list.items)}
                      className="text-xs bg-orange-500 text-white px-2 py-1 rounded-md hover:bg-orange-600"
                    >
                      Apply
                    </button>
                    <IoCloseCircleOutline
                      size={18}
                      className="cursor-pointer hover:text-red-500 text-gray-500"
                      onClick={() => deleteList(list._id)}
                    />
                  </div>
                </div>
                <ul className="text-xs list-disc ml-4 text-gray-600 space-y-0.5">
                  {list.items.map((i, idx) => (
                    <li key={idx}>{i.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
