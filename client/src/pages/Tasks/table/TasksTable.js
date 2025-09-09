import { MaterialReactTable } from "material-react-table";

export const TasksTable = ({ table }) => {
  return (
    <div className="w-full min-h-[10vh] relative -mt-[10px] ">
      <div className="h-full hidden1 overflow-y-scroll relative">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};
