
const SelectedUsers = ({ userNameArr, selectedUsers, setSelectedUsers, countMap, label }) => {
  return (
    <div className="space-y-0.5">
      {userNameArr.map((user) => {
        const isSelected = selectedUsers.includes(user);
        const count = countMap[user] || 0;

        return (
          <div
            key={user}
            onClick={() => {
              setSelectedUsers((prev) =>
                prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
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
                  {user}
                </span>
              </div>
            </div>

            {/* Count Badge - Enterprise Style */}
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


export default SelectedUsers;









// const SelectedUsers = ({ userNameArr, selectedUsers, setSelectedUsers, countMap, label }) => {
//   return (
//     <>
//       {userNameArr.map((user) => {
//         const isSelected = selectedUsers.includes(user);
//         const count = countMap[user] || 0;

//         return (
//           <div
//             key={user}
//             onClick={() => {
//               setSelectedUsers((prev) =>
//                 prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
//               );
//             }}
//             className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${
//               isSelected
//                 ? 'bg-orange-50/50 border-orange-100 text-orange-900'
//                 : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
//             }`}
//           >
//             <div className="flex items-center gap-3">
//               {/* Mini Checkbox */}
//               <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
//                 isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-slate-400'
//               }`}>
//                 {isSelected && (
//                   <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                   </svg>
//                 )}
//               </div>

//               {/* User Name */}
//               <span className="text-xs font-semibold truncate">{user}</span>
//             </div>

//             {/* Task Count Badge */}
//             <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md text-nowrap">
//               {count} {count === 1 ? label : `${label}s`}
//             </span>
//           </div>
//         );
//       })}
//     </>
//   );
// };