import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function QuickAccess() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    handleClose(); 
    navigate(path);
    return;
  };

  return (
    <>

      <button className="w-full   text-2xl" onClick={handleClick}>
        <FiPlusCircle className="hover:text-orange-500 transition-all duration-200 text-gray-600      " />
      </button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleNavigation("/job-planning")}>
          Jobs
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/tasks")}>Tasks</MenuItem>
        <MenuItem onClick={() => handleNavigation("/leads")}>Leads</MenuItem>
        <MenuItem onClick={() => handleNavigation("/tickets")}>
          Tickets
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/templates")}>
          Templates
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/subscriptions")}>
          Subscription
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/timesheet")}>
          Timesheet
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/hr/tasks")}>HR</MenuItem>
      </Menu>
    </>
  );
}
