const SelectedUsers = ({ userNameArr, selectedUsers, setSelectedUsers }) => {
  return (
    <ul className="space-y-1">
      {userNameArr.map((user) => {
        const checked = selectedUsers.includes(user);

        return (
          <li key={user}>
            <label
              className={`flex items-center gap-2 rounded-md px-2 py-1.5
                text-sm cursor-pointer transition
                ${checked
                  ? "bg-orange-50 text-orange-700"
                  : "text-slate-700 hover:bg-slate-100"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  setSelectedUsers((prev) =>
                    prev.includes(user)
                      ? prev.filter((u) => u !== user)
                      : [...prev, user]
                  )
                }
                className="h-4 w-4 accent-orange-600"
              />
              <span className="truncate">{user}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default SelectedUsers;
