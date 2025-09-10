export const departmentsColumn = (ctx) => {


    return         {
          id: "Departments",
          accessorKey: "job.jobName",
          header: "Departments",
          filterFn: "equals",
          Header: ({ column }) => {
            const deparments = [
              "Bookkeeping",
              "Payroll",
              "Vat Return",
              "Personal Tax",
              "Accounts",
              "Company Sec",
              "Address",
            ];
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Departments
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
          filterSelectOptions: [
            "Bookkeeping",
            "Payroll",
            "Vat Return",
            "Personal Tax",
            "Accounts",
            "Company Sec",
            "Address",
          ],

          filterVariant: "select",
          size: 105,
          minSize: 100,
          maxSize: 140,
          grow: false,
        }
}