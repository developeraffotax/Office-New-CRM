export const TopTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "subtasks", label: "Sub Tasks" },
    { key: "jobDetail", label: "Job Detail" },
    { key: "salesDetail", label: "Sales" },
    { key: "loginInfo", label: "Login Info" },
    { key: "departmentInfo", label: "Department" },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2 h-[10%]  mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`relative px-2 sm:px-2 py-1 text-sm font-medium transition-all duration-200 text-nowrap
            ${
              activeTab === tab.key
                ? "text-orange-600 font-semibold"
                : "text-gray-600 hover:text-orange-500"
            }`}
        >
          {tab.label}
          <span
            className={`absolute left-0 bottom-0 h-[2px] w-full rounded-full transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-orange-600 opacity-100"
                : "bg-orange-600 opacity-0"
            }`}
          />
        </button>
      ))}
    </div>
  );
};
