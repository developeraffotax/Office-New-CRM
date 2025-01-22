import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";

export default function UsersTimeSheet({ timerData, userData, active }) {
  const [userTimes, setUserTimes] = useState([]);

  console.log("userTimes:", userTimes);

  // Helper function to format time
  // const formatTime = (milliseconds) => {
  //   const totalMinutes = Math.floor(milliseconds / 60000);
  //   const hours = Math.floor(totalMinutes / 60);
  //   const minutes = totalMinutes % 60;

  //   return `${String(hours)}h:${String(minutes).padStart(2, "0")}m`;
  // };

  // useEffect(() => {
  //   const calculateTimes = () => {
  //     const timesByUser = userData?.map((user) => {
  //       const userTimers = timerData?.filter(
  //         (entry) => entry?.jobHolderName === user.name
  //       );

  //       let monTotal = 0;
  //       let tueTotal = 0;
  //       let wedTotal = 0;
  //       let thuTotal = 0;
  //       let friTotal = 0;
  //       let satTotal = 0;
  //       let sunTotal = 0;

  //       userTimers.forEach((entry) => {
  //         const startTime = new Date(entry.startTime);
  //         const endTime = new Date(entry.endTime);

  //         if (!isNaN(startTime) && !isNaN(endTime)) {
  //           const diffMs = Math.abs(endTime - startTime);
  //           const day = startTime.getDay();

  //           switch (day) {
  //             case 1:
  //               monTotal += diffMs;
  //               break;
  //             case 2:
  //               tueTotal += diffMs;
  //               break;
  //             case 3:
  //               wedTotal += diffMs;
  //               break;
  //             case 4:
  //               thuTotal += diffMs;
  //               break;
  //             case 5:
  //               friTotal += diffMs;
  //               break;
  //             case 6:
  //               satTotal += diffMs;
  //               break;
  //             case 0:
  //               sunTotal += diffMs;
  //               break;
  //             default:
  //               break;
  //           }
  //         }
  //       });

  //       const weekTotal =
  //         monTotal +
  //         tueTotal +
  //         wedTotal +
  //         thuTotal +
  //         friTotal +
  //         satTotal +
  //         sunTotal;

  //       return {
  //         userName: user.name,
  //         userAvatar: user.avatar,
  //         monTotal: formatTime(monTotal),
  //         tueTotal: formatTime(tueTotal),
  //         wedTotal: formatTime(wedTotal),
  //         thuTotal: formatTime(thuTotal),
  //         friTotal: formatTime(friTotal),
  //         satTotal: formatTime(satTotal),
  //         sunTotal: formatTime(sunTotal),
  //         weekTotal: formatTime(weekTotal),
  //         difference:
  //           monTotal +
  //           tueTotal +
  //           wedTotal +
  //           thuTotal +
  //           friTotal +
  //           satTotal +
  //           sunTotal -
  //           weekTotal,
  //       };
  //     });

  //     setUserTimes(timesByUser);
  //   };

  //   calculateTimes();
  // }, [timerData, userData]);

  useEffect(() => {
    const calculateTimes = () => {
      const timesByUser = userData?.map((user) => {
        const userTimers = timerData?.filter(
          (entry) => entry?.jobHolderName === user?.name
        );

        let monTotal = 0;
        let tueTotal = 0;
        let wedTotal = 0;
        let thuTotal = 0;
        let friTotal = 0;
        let satTotal = 0;
        let sunTotal = 0;

        userTimers?.forEach((entry) => {
          const startTime = new Date(entry?.startTime);
          const endTime = new Date(entry?.endTime);

          if (!isNaN(startTime) && !isNaN(endTime)) {
            const diffMs = Math.abs(endTime - startTime);
            const day = startTime.getDay();

            switch (day) {
              case 1:
                monTotal += diffMs;
                break;
              case 2:
                tueTotal += diffMs;
                break;
              case 3:
                wedTotal += diffMs;
                break;
              case 4:
                thuTotal += diffMs;
                break;
              case 5:
                friTotal += diffMs;
                break;
              case 6:
                satTotal += diffMs;
                break;
              case 0:
                sunTotal += diffMs;
                break;
              default:
                break;
            }
          }
        });

        const weekTotal =
          monTotal +
          tueTotal +
          wedTotal +
          thuTotal +
          friTotal +
          satTotal +
          sunTotal;

        const monthTotal = weekTotal;

        const weeklyDifference = formatDifference(
          weekTotal - 40 * 60 * 60 * 1000
        );
        const monthlyDifference = formatDifference(
          monthTotal - 160 * 60 * 60 * 1000
        );

        return {
          userName: user.name,
          userAvatar: user.avatar,
          monTotal: formatTime(monTotal),
          tueTotal: formatTime(tueTotal),
          wedTotal: formatTime(wedTotal),
          thuTotal: formatTime(thuTotal),
          friTotal: formatTime(friTotal),
          satTotal: formatTime(satTotal),
          sunTotal: formatTime(sunTotal),
          weekTotal: formatTime(weekTotal),
          weeklyDifference,
          monthlyDifference,
        };
      });

      setUserTimes(timesByUser);
    };

    calculateTimes();
  }, [timerData, userData]);

  // Helper function to format time in milliseconds to "HH:MM"
  const formatTime = (timeInMs) => {
    const totalMinutes = Math.floor(timeInMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h:${minutes}m`;
  };

  // Helper function to format the difference
  const formatDifference = (differenceInMs) => {
    const sign = differenceInMs >= 0 ? "+" : "-";
    const absoluteDifference = Math.abs(differenceInMs);
    const totalMinutes = Math.floor(absoluteDifference / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${sign}${hours}h:${minutes}m`;
  };

  function convertToMinutes(time) {
    if (!time || typeof time !== "string" || !time.includes("h:")) {
      console.error(`Invalid time format: ${time}`);
      return 0;
    }

    const [hours, minutes] = time.split("h:").map((val) => parseInt(val, 10));
    return (hours || 0) * 60 + (minutes || 0);
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "Job Holder",
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
                Job Holder
              </span>

              <select
                value={column.getFilterValue()}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {userData?.map((jobhold, i) => (
                  <option key={i} value={jobhold?.name}>
                    {jobhold?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = row.original.userName;
          const avatar = row.original.userAvatar;

          return (
            <div className="w-full flex ">
              <div className="flex items-center gap-2">
                <div className="w-[2.6rem] h-[2.6rem] relative rounded-full overflow-hidden object-fill">
                  <img
                    src={avatar ? avatar : "/profile1.jpeg"}
                    alt="avater"
                    className="w-full h-full object-fill rounded-full border border-gray-300"
                  />
                </div>
                <span className="text-center">{jobholder}</span>
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          return (cellValue || "").toString() === filterValue.toString();
        },
        filterSelectOptions: userData.map((jobhold) => jobhold?.name || ""),
        filterVariant: "select",
        size: 160,
        minSize: 80,
        maxSize: 200,
        grow: false,
      },
      {
        accessorKey: "monday",
        header: "Monday",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Monday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const monTotal = row.original.monTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-center ${
                  convertToMinutes(monTotal) < convertToMinutes("8h:0m")
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {monTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "tueTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Tuesday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const tueTotal = row.original.tueTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-center ${
                  convertToMinutes(tueTotal) < convertToMinutes("8h:0m")
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {tueTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "wedTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Wednesday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const wedTotal = row.original.wedTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-center ${
                  convertToMinutes(wedTotal) < convertToMinutes("8h:0m")
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {wedTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "thuTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Thursday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const thuTotal = row.original.thuTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-center ${
                  convertToMinutes(thuTotal) < convertToMinutes("8h:0m")
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {thuTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "friTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Friday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const friTotal = row.original.friTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-center ${
                  convertToMinutes(friTotal) < convertToMinutes("8h:0m")
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {friTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "satTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Saturday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const satTotal = row.original.satTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-center">
                {satTotal === "0h:0m" || !satTotal ? "--" : satTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "sunTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Sunday</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const sunTotal = row.original.sunTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-center">
                {sunTotal === "0h:0m" || !sunTotal ? "--" : sunTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "weekTotal",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Total</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const weekTotal = row.original.weekTotal;

          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-center px-2 py-1 rounded-md text-white font-medium bg-green-800 ">
                {weekTotal}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "difference",
        Header: ({ column }) => {
          return (
            <div className=" flex items-center justify-center w-[5.5rem]">
              <span className="ml-1 cursor-pointer ">Difference</span>
            </div>
          );
        },
        Cell: ({ row }) => {
          const weekDiff = row.original.weeklyDifference;
          const monthDiff = row.original.monthlyDifference;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-center ${
                  (
                    active === "Weekly"
                      ? weekDiff.includes("+")
                      : monthDiff.includes("+")
                  )
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {active === "Weekly" ? weekDiff : monthDiff}
              </span>
            </div>
          );
        },
        size: 100,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
    ],
    // eslint-disable-next-line
    [userTimes, userData, active]
  );

  const table = useMaterialReactTable({
    columns,
    data: userTimes || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    // columnFilterDisplayMode: "popover",
    muiTableContainerProps: {
      sx: {
        maxHeight: {
          xs: "490px",
          sm: "490px",
          md: "490px",
          lg: "490px",
          xl: "490px",
        },
        "@media (min-width: 1500px) and (max-width: 1800px)": {
          maxHeight: "700px",
        },

        "@media (min-width: 1800px)": {
          maxHeight: "780px",
        },
      },
    },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,

    enablePagination: true,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "rgb(193, 183, 173, 0.8)",
        color: "#000",
        padding: ".7rem 0.3rem",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid rgba(203, 201, 201, 0.5)",
      },
    },
    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": {
          backgroundColor: "#f0f0f0",
        },
        tableLayout: "auto",
        fontSize: "13px",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  return (
    <div className="users-timesheet">
      <div className="h-full hidden1 overflow-y-auto  relative">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
