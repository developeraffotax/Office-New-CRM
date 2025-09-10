import React from "react";

export const createSubscriptionTypeColumn = ({ subscriptions, handleUpdateSubscription }) => ({
  accessorKey: "subscription",
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="  cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Subscription
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {subscriptions?.map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const subscription = cell.getValue();
    return (
      <div className="w-full">
        <select
          value={subscription || ""}
          onChange={(e) =>
            handleUpdateSubscription(
              row.original._id,
              e.target.value,
              "subscription"
            )
          }
          className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
        >
          <option value="empty"></option>
          {subscriptions.map((sub, i) => (
            <option value={sub} key={i}>
              {sub}
            </option>
          ))}
        </select>
      </div>
    );
  },
  filterFn: "equals",
  filterSelectOptions: subscriptions.map((sub) => sub),
  filterVariant: "select",
  size: 110,
  minSize: 70,
  maxSize: 140,
  grow: false,
});

export default createSubscriptionTypeColumn;


