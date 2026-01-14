const SelectedUsers = ({ userNameArr, selectedUsers, setSelectedUsers }) => {
  return (
    <>
      {userNameArr.map((user) => {
        const isSelected = selectedUsers.includes(user);
        return (
          <div
            key={user}
            onClick={() => {
              setSelectedUsers((prev) =>
                prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
              );
            }}
            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${
              isSelected
                ? 'bg-orange-50/50 border-orange-100 text-orange-900'
                : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {/* Classy Mini-Checkbox */}
            <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
              isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-slate-400'
            }`}>
              {isSelected && (
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs font-semibold truncate">{user}</span>
          </div>
        );
      })}
    </>
  );
};

export default SelectedUsers;
