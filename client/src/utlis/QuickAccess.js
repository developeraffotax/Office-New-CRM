import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function QuickAccess() {

  const {auth} = useAuth();

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  

  const handleNavigation = (path) => {
    handleClose(); 
    navigate(path);
    return;
  };


  console.log("auth", auth.user.role.access);

  return (
    <>

      <button className="   text-2xl" onClick={handleClick}>
        <FiPlusCircle className="hover:text-orange-500 transition-all duration-200 text-gray-600      " />
      </button>

      <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{ "aria-labelledby": "basic-button", }} >



       {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Jobs')) && <MenuItem onClick={() => handleNavigation("/job-planning")}> Jobs </MenuItem>}
        {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Tasks')) && <MenuItem onClick={() => handleNavigation("/tasks")}>Tasks</MenuItem>}
        {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Leads')) && <MenuItem onClick={() => handleNavigation("/leads")}>Leads</MenuItem>}
        {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Tickets')) && <MenuItem onClick={() => handleNavigation("/tickets")}> Tickets </MenuItem>}
        {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Templates')) && <MenuItem onClick={() => handleNavigation("/templates")}> Templates </MenuItem>}
        {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Subscription')) && <MenuItem onClick={() => handleNavigation("/subscriptions")}> Subscription </MenuItem>}
       {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'Timesheet')) && <MenuItem onClick={() => handleNavigation("/timesheet")}> Timesheet </MenuItem>}
        {(auth?.user?.role?.name === "Admin" || auth?.user?.role?.access?.some(el => el.permission === 'HR')) && <MenuItem onClick={() => handleNavigation("/hr/tasks")}>HR</MenuItem>}
      </Menu>
    </>
  );
}
// cassie leonoir