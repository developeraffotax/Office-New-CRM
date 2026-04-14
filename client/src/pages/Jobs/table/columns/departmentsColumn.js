export const departmentsColumn = (ctx) => {

  const deparments = [
              "Bookkeeping",
              "Payroll",
              "Vat Return",
              "Personal Tax",
              "Accounts",
              "Company Sec",
              "Address",
            ];


    return         {
          id: "Department",
          accessorKey: "job.jobName",
          header: "Department",
          
          Header: ({ column }) => {
            
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Department
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {deparments?.map((depart, i) => (
                    <option key={i} value={depart}>
                      {depart}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
         

            filterFn: "equals",
          filterSelectOptions: deparments,
          filterVariant: "select",

          size: 105,
          minSize: 100,
          maxSize: 140,
          grow: false,
        }
}