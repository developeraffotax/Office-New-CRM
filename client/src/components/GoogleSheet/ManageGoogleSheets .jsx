import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import Spinner from "../../utlis/Spinner";
import SheetFormModal from "./SheetFormModal";
import { fetchMySheets } from "../../redux/slices/googleSheetSlice";
import {
  getAllSheetsApi,
  getAssignableUsersApi,
  updateSheetApi,
  deleteSheetApi,
  reorderSheetsApi,
} from "../../services/googlesheetService";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const MAX_CHIPS = 3;
const userLabel = (u) => u.name || u.email || u._id;

export default function ManageGoogleSheets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.auth?.user);
  const isAdmin = user?.role?.name === "Admin";

  const [sheets, setSheets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, sheet: null });

  // inside the component
  const onDragEnd = async ({ source, destination }) => {
    if (!destination || destination.index === source.index) return;

    const prev = sheets;
    const next = Array.from(sheets);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);

    setSheets(next); // optimistic

 
    try {
      await reorderSheetsApi(next.map((s) => s._id));
      dispatch(fetchMySheets()); // sidebar picks up the new order
    } catch (err) {
      setSheets(prev); // roll back
      toast.error(err?.response?.data?.message || "Failed to save order");
    }
  };

  const load = useCallback(async () => {
    try {
      const [sheetsRes, usersRes] = await Promise.all([
        getAllSheetsApi(),
        getAssignableUsersApi(),
      ]);
      setSheets(sheetsRes.data.sheets || []);
      setAllUsers(usersRes.data.users || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load sheets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  // refresh both this table and the sidebar
  const refreshAll = async () => {
    await load();
    dispatch(fetchMySheets());
  };

  const toggleActive = async (sheet) => {
    try {
      await updateSheetApi(sheet._id, { isActive: !sheet.isActive });
      await refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const remove = async (sheet) => {
    if (
      !window.confirm(
        `Delete "${sheet.name}"? Assigned users will lose access.`,
      )
    )
      return;
    try {
      await deleteSheetApi(sheet._id);
      toast.success("Sheet deleted");
      await refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  if (!isAdmin) return <Navigate to="/employee/dashboard" replace />;

  return (
    <div className="p-4 md:p-6 font-google">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Manage Google Sheets</h1>
          <p className="text-sm text-gray-500">
            Add sheets and choose which users can see them in their sidebar.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, sheet: null })}
          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          + Add Sheet
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center ">
          <Spinner text="Loading sheets..." />
        </div>
      ) : sheets.length === 0 ? (
        <div className="border border-dashed rounded-xl p-10 text-center text-sm text-gray-500">
          No sheets yet. Click "Add Sheet" to create the first one.
        </div>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="w-8 px-2 py-3" />
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Users</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <Droppable droppableId="sheets">
                {(dropProvided) => (
                  <tbody
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className="divide-y"
                  >
                    {sheets.map((sheet, index) => {
                      const users = sheet.users || [];
                      return (
                        <Draggable
                          key={sheet._id}
                          draggableId={String(sheet._id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                // keeps cells from collapsing while the row is lifted
                                display: snapshot.isDragging
                                  ? "table"
                                  : undefined,
                              }}
                              className={`hover:bg-gray-50 ${
                                snapshot.isDragging
                                  ? "bg-orange-50 shadow-lg"
                                  : "bg-white"
                              }`}
                            >
                              <td className="px-2 py-3 w-8">
                                <span
                                  {...provided.dragHandleProps}
                                  title="Drag to reorder"
                                  className="cursor-grab select-none text-gray-400 hover:text-gray-600"
                                >
                                  ☰
                                </span>
                              </td>

                              <td className="px-4 py-3 font-medium">
                                {sheet.name}
                              </td>
                              <td className="px-4 py-3">
                                {users.length === 0 ? (
                                  <span className="text-gray-400">
                                    No users
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {users.slice(0, MAX_CHIPS).map((u) => (
                                      <span
                                        key={u._id}
                                        className="px-2 py-0.5 rounded-full bg-gray-100 text-xs"
                                      >
                                        {userLabel(u)}
                                      </span>
                                    ))}
                                    {users.length > MAX_CHIPS && (
                                      <span
                                        title={users
                                          .slice(MAX_CHIPS)
                                          .map(userLabel)
                                          .join(", ")}
                                        className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs"
                                      >
                                        +{users.length - MAX_CHIPS}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleActive(sheet)}
                                  title="Click to toggle"
                                  className={`px-2 py-0.5 rounded-full text-xs border ${
                                    sheet.isActive
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-gray-100 text-gray-500 border-gray-200"
                                  }`}
                                >
                                  {sheet.isActive ? "Active" : "Hidden"}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() =>
                                      navigate(`/google-sheets/${sheet._id}`)
                                    }
                                    className="text-orange-600 hover:underline"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() =>
                                      setModal({ open: true, sheet })
                                    }
                                    className="text-blue-600 hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => remove(sheet)}
                                    className="text-red-600 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      );
                    })}
                    {dropProvided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        </div>
      )}

      {modal.open && (
        <SheetFormModal
          sheet={modal.sheet}
          allUsers={allUsers}
          onClose={() => setModal({ open: false, sheet: null })}
          onSaved={refreshAll}
        />
      )}
    </div>
  );
}
