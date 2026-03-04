import React from "react";
import { Button, Badge, Box, Tooltip } from "@mui/material";

// Custom Funnel Icon - matches your clean SVG
const FilterIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 2.5h12M3.5 6.5h8M5.5 10.5h4"
      stroke="currentColor"
      strokeWidth={active ? "2" : "1.5"}
      strokeLinecap="round"
      style={{ transition: "stroke-width 0.2s ease" }}
    />
  </svg>
);

const UserTabToggleButton = ({ active, onClick }) => {
  return (
     
 
        <Button
          onClick={onClick}
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
            p: 0,
            borderRadius: "8px",
            transition: "all 0.15s ease",
            border: "1.5px solid",
            
            // Inactive State
            ...(!active && {
              backgroundColor: "#fff",
              borderColor: "#e2e5ea",
              color: "#8a92a0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              "&:hover": {
                borderColor: "#3b82f6",
                color: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.04)",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.08), 0 1px 2px rgba(0,0,0,0.06)",
              },
            }),

            // Active State
            ...(active && {
              backgroundColor: "#eff6ff",
              borderColor: "#3b82f6",
              color: "#2563eb",
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(59,130,246,0.15)",
              "&:hover": {
                backgroundColor: "#dbeafe",
                boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.12), 0 1px 4px rgba(59,130,246,0.2)",
              },
            }),

            // Press effect
            "&:active": {
              transform: "scale(0.92)",
            },
          }}
        >
          <FilterIcon active={active} />
        </Button>
 
    
  );
};

export default UserTabToggleButton;