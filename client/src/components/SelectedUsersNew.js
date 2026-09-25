import { getJuniorsList } from "../utlis/getJuniorsList";

 
const SelectedUsersNew = ({
  users,
  selectedUsers,
  setSelectedUsers,
  countMap,
  label,
  current_user,
}) => {
  const juniors = getJuniorsList(users, current_user);

  return (
    <div className="space-y-0.5">
      {juniors.map((user) => {
        const isSelected = selectedUsers.includes(user.name);
        const count = countMap[user.name] || 0;

        return (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUsers((prev) =>
                prev.includes(user.name)
                  ? prev.filter((name) => name !== user.name)
                  : [...prev, user.name]
              );
            }}
            className={`group relative flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-all duration-200 border-l-2 ${
              isSelected
                ? 'bg-orange-50/40 border-l-orange-600'
                : 'border-l-transparent hover:bg-slate-50/60 hover:border-l-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Modern Checkbox */}
              <div className={`relative flex-shrink-0 w-4 h-4 rounded transition-all ${
                isSelected
                  ? 'bg-orange-600'
                  : 'bg-white border-2 border-slate-300 group-hover:border-slate-400'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white absolute inset-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* User Info */}
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-medium truncate leading-tight ${
                  isSelected ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {user.name}
                </span>
              </div>
            </div>

            {/* Count Badge */}
            <div className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${
              isSelected
                ? 'bg-orange-100'
                : 'bg-slate-100 group-hover:bg-slate-150'
            }`}>
              <span className={`text-xs font-semibold tabular-nums ${
                isSelected ? 'text-orange-700' : 'text-slate-600'
              }`}>
                {count}
              </span>
              <span className={`text-xs font-normal ${
                isSelected ? 'text-orange-600' : 'text-slate-500'
              }`}>
                {count === 1 ? label : `${label}s`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectedUsersNew;