import SelectedUsers from "../components/SelectedUsers";
import { usePersistedUsers } from "../hooks/usePersistedUsers";

export const renderColumnControls = (allCols, columnVisibility, setColumnVisibility, name, selectedUsers, setSelectedUsers, users) => {



 


    const toggleColumnVisibility = (column) => {
        const updatedVisibility = {
            ...columnVisibility,
            [column]: !columnVisibility[column],
        };
        setColumnVisibility(updatedVisibility);
        localStorage.setItem(
            `visibileTicketsColumn`,
            JSON.stringify(updatedVisibility)
        );
    };


    return (
         <section className="w-[520px] rounded-lg bg-white border border-slate-200 shadow-sm">
    {/* Header */}
    <header className="px-5 py-3 border-b">
      <h3 className="text-sm font-semibold text-slate-800">
        View settings
      </h3>
    </header>

    {/* Content */}
    <div className="grid grid-cols-2 divide-x">
      {/* LEFT — Columns */}
      <section className="px-5 py-4">
        <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Columns
        </h4>

        <ul className="space-y-1 list-decimal">
          {Object.keys(allCols)?.map((column) => (
            <li key={column}>
              <label
                className="flex items-center justify-between rounded-md px-2 py-1.5
                           text-sm text-slate-700 cursor-pointer
                           hover:bg-slate-50 transition"
              >
                <span className="capitalize">{column}</span>
                <input
                  type="checkbox"
                  checked={columnVisibility[column]}
                  onChange={() => toggleColumnVisibility(column)}
                  className="h-4 w-4 accent-orange-600"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* RIGHT — Users */}
      <section className="px-5 py-4">
        <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Users
        </h4>

        <div className="h-full overflow-y-auto space-y-1 pr-1">
          <SelectedUsers
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            userNameArr={users}
            coun
          />
        </div>
      </section>
    </div>
  </section>
    )








}







 