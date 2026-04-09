import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react"; 
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { Paper, Stack, FormControl, Select, MenuItem, Button, Menu, Divider, Box, Typography, Chip, Grow, IconButton, Tooltip, ToggleButton, } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { alpha } from "@mui/material/styles";
import { FiCalendar, FiX, FiChevronDown, FiLayers, FiMoreVertical, } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import AutorenewIcon from '@mui/icons-material/Autorenew';

import ManageCategoriesModal from "../categories/ManageCategoriesModal";
import InboxUserTabs from "./ui/InboxUserTabs";
import UserTabToggleButton from "./ui/UserTabToggleButton";
import ContextMenu from "./ui/ContextMenu";
import UnifiedThreadFilters from "./ui/LastMessageByDropdown";




export default function Filters({ filters, setFilters, users = [], categories = [], }) {

  const { auth: { user } } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.name === "Admin";

  const [searchParams] = useSearchParams();
  const folder = searchParams.get("folder") || "inbox";
  const companyName = searchParams.get("companyName") || "affotax";

  const [inboxStats, setInboxStats] = useState(null);
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [isInboxUserTabs, setIsInboxUserTabs] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const prevSearchRef = useRef("");




  const applyPreset = (days) => {
    const now = dayjs();
    let start;
    let end;

    if (days === 0) {
      start = now.startOf("day");
      end = now.endOf("day");
    } else if (days === -1) {
      start = now.subtract(1, "day").startOf("day");
      end = now.subtract(1, "day").endOf("day");
    } else {
      start = now.subtract(days, "day").startOf("day");
      end = now.endOf("day");
    }

    setFilters({ ...filters, startDate: start.toISOString(), endDate: end.toISOString(), page: 1, });
    setAnchorEl(null);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      userId: "",
      unreadOnly: false,
      startDate: "",
      endDate: "",
      page: 1,
      search: "",
      lastMessageBy: "",
      starred: false,
      mailThreadId: ""
    });

    setSearchInput("");
  };

  const handleUpdate = (updates) => {
    setFilters({ ...updates, page: 1 });
  };






  useEffect(() => {
    if (!isAdmin || !isInboxUserTabs) return;

    const fetchUserCounts = async () => {
      try {
        const res = await axios.get( `${process.env.REACT_APP_API_URL}/api/v1/gmail/mailbox-user-counts`, { params: { companyName: companyName, folder: folder, ...filters, }, }, );

        if (res.data?.success) {
          setInboxStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch user counts", err);
      }
    };

    fetchUserCounts();
  }, [filters, folder, companyName, isAdmin, isInboxUserTabs]);



  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed && !prevSearchRef.current) return;

    const timer = setTimeout(() => {
      if (trimmed === prevSearchRef.current) return;
      setFilters({
        search: trimmed,
        page: 1,
      });
      prevSearchRef.current = trimmed;
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);








    // Common styles for a compact, modern look
  const selectStyle = {
    borderRadius: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f1f3f5",
      borderColor: "#dee2e6",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none", // Remove standard MUI border for a cleaner look
    },
    "& .MuiSelect-select": {
      py: 1,
      fontSize: "0.875rem",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
    },
  };


  const hasActiveFilters = filters.category || filters.userId || filters.unreadOnly || filters.starred || filters.startDate;



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", }} >
        <Stack direction="row" spacing={4} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: hasActiveFilters ? 2 : 0 }} >
          <Stack direction="row" spacing={1} alignItems="center">
            <button onClick={clearFilters} title="Clear all filters" className={`group flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-110 hover:rotate-180 cursor-pointer mb-1 outline-none `} >
              <IoClose className="h-5 w-5" />
            </button>

            {/* 1. Category Select */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={filters.category || ""}
                displayEmpty
                onChange={(e) => handleUpdate({ category: e.target.value })}
                IconComponent={FiChevronDown}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          opacity: 0.7,
                        }}
                      >
                        <FiLayers size={14} />
                        <Typography variant="body2">All</Typography>
                      </Box>
                    );
                  }
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FiLayers size={14} color="#3b82f6" />
                      <Typography variant="body2">
                        {selected.charAt(0).toUpperCase() + selected.slice(1)}
                      </Typography>
                    </Box>
                  );
                }}
                sx={selectStyle}
              >
                <MenuItem value=""> <Typography variant="body2" fontWeight={600}> All </Typography> </MenuItem>
                <MenuItem sx={{ borderBottom: 1, borderColor: "#ddd", }} value={"unassigned"} > {" "} Unassigned{" "} </MenuItem>

                {categories.map(({ name }) => {
                  return  <MenuItem value={name}> {name.charAt(0).toUpperCase() + name.slice(1)} </MenuItem>;
                })}
              </Select>

            </FormControl>

            {[
              { label: "T", title: "Today", value: 0 },
              { label: "Y", title: "Yesterday", value: -1 },
              { label: "3D", title: "Last 3 Days", value: 3 },
              { label: "7D", title: "Last 7 Days", value: 7 },
            ].map((range) => {
              const isActive = (() => {
                if (!filters.startDate) return false;
                const now = dayjs();
                let expectedStart;
                if (range.value === 0) expectedStart = now.startOf("day");
                else if (range.value === -1)
                  expectedStart = now.subtract(1, "day").startOf("day");
                else
                  expectedStart = now
                    .subtract(range.value, "day")
                    .startOf("day");
                return dayjs(filters.startDate).isSame(expectedStart, "minute");
              })();

              return (
                <Tooltip key={range.label} title={range.title}>
                  <Button
                    size="small"
                    onClick={() => applyPreset(range.value)}
                    sx={{
                      minWidth: 36,
                      width: 36,
                      height: 36,
                      p: 0,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      border: "1px solid",
                      borderColor: isActive
                        ? "primary.main"
                        : "rgba(0,0,0,0.15)",
                      color: isActive ? "primary.main" : "text.secondary",
                      bgcolor: isActive
                        ? (theme) => alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                        borderColor: "primary.main",
                        color: "primary.main",
                      },
                    }}
                  >
                    {range.label}
                  </Button>
                </Tooltip>
              );
            })}




            {/* Last Message By Client Quick Filter */}
<ToggleButton
  value="lastMessageClient"
  size="small"
  selected={filters.lastMessageBy === "client"}
  onChange={() =>
    handleUpdate({
      lastMessageBy:
        filters.lastMessageBy === "client"
          ? ""
          : "client",
    })
  }
  title="Last message sent by client"
  color="primary"
  sx={{
    border: "none",
    borderRadius: "8px",
  }}
>
  {/* Client badge style icon */}
  <Box
    sx={{
      width: 18,
      height: 18,
      borderRadius: "50%",
      bgcolor:
        filters.lastMessageBy === "client"
          ? "primary.main"
          : "grey.400",
      color: "white",
      fontSize: "0.65rem",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    C
  </Box>
</ToggleButton>


<Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center" }} />



            <ToggleButton
              value="starred"
              size="small"
              selected={filters.starred === true}
              onChange={() =>
                handleUpdate({
                  starred: !filters.starred,
                })
              }
              title={`Starred Emails`}
              color="warning"
              sx={{
                border: "none",
                borderRadius: "8px",
              }}
            >
              {filters.starred ? (
                <StarIcon fontSize="small" />
              ) : (
                <StarOutlineIcon fontSize="small" />
              )}
            </ToggleButton>







            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center" }} />

            
            <ToggleButton
              value="unread"
              size="small"
              title="Show Unread Only"
              selected={filters.unreadOnly}
              onChange={() =>
                handleUpdate({ unreadOnly: !filters.unreadOnly })
              }
              color="primary"
              sx={{ border: "none", borderRadius: "8px" }}
            >
              <MarkEmailUnreadIcon fontSize="small" />
            </ToggleButton>
 

            <FormControl size="small" sx={{ minWidth: 300 }}>
              <Box sx={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search subject, email…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    height: 40,
                    width: "100%",
                    padding: "0 40px 0 12px", // space for ❌
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    outline: "none",
                    fontSize: "0.875rem",
                  }}
                />

                {/* Clear Button */}
                {searchInput.trim() && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchInput("");

                    }}
                    sx={{
                      position: "absolute",
                      right: 6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "grey.500",
                      "&:hover": { color: "grey.700" },
                    }}
                  >
                    <FiX size={14} />
                  </IconButton>
                )}
              </Box>
            </FormControl>

                

                


<ToggleButton
  value="status"
  size="small"
  selected={filters.status === "progress"}
  color="primary"
  onChange={() =>
    handleUpdate({
      status: filters.status === "progress" ? "" : "progress",
    })
  }
  title="Show emails in progress"
 sx={{
    border: "none",
    borderRadius: "8px",
  }}
>
  {/* Client badge style icon */}
  <Box
    sx={{
      width: 18,
      height: 18,
      borderRadius: "50%",
      bgcolor:
        filters.status === "progress"
          ? "primary.main"
          : "grey.400",
      color: "white",
      fontSize: "0.65rem",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    P
  </Box>
</ToggleButton>


    { isAdmin && <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center" }} />}

              
                {isAdmin && ( <UserTabToggleButton active={isInboxUserTabs} onClick={() => setIsInboxUserTabs((prev) => !prev)} /> )}
                
                {/* Date Picker Trigger */}
            <Button
              variant="outlined"
              size="medium"
              color="inherit"
              startIcon={<FiCalendar size={16} />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "rgba(0,0,0,0.23)",
                px: 2,
                height: 40,
              }}
            >
              {filters.startDate ? (
                <Typography variant="body2" fontWeight={500}>
                  {dayjs(filters.startDate).format("MMM DD")} —{" "}
                  {dayjs(filters.endDate).format("MMM DD")}
                </Typography>
              ) : (
                "Date Range"
              )}
            </Button>



          
              <UnifiedThreadFilters filters={filters} handleUpdate={handleUpdate} />

              {/* <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center" }} /> */}



          </Stack>



          <Stack direction="row" spacing={1} alignItems="center">
            <ContextMenu
              trigger={
                <button className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition">
                  <FiMoreVertical className="text-gray-600 text-lg" />
                </button>
              }
              items={[
                { type: "label", label: "CATEGORIES" },

                {
                  icon: <LabelOutlinedIcon sx={{ fontSize: 18 }} />,
                  label: "Manage Categories",
                  onClick: () => setIsCategoryModal(true),
                },
              ]}
            />
          </Stack>


        </Stack>

        {isInboxUserTabs && isAdmin && (
          <div className="w-full animate-pop mt-3   ">
            <InboxUserTabs
              droppableId="inbox_users"
              users={users}
              activeValue={filters.userId || ""}
              showAll={true}
              onChange={(userId) =>
                setFilters({
                  userId,
                  page: 1,
                })
              }
              getLabelFn={(user) => user.name}
              getCountFn={(user) => {
                if (!inboxStats) return 0;

                // ALL TAB
                if (user === "all") {
                  return inboxStats.allCount || 0;
                }

                // UNASSIGNED
                if (user === "unassigned") {
                  return inboxStats.unassignedCount || 0;
                }

                const found = inboxStats.userCounts?.find(
                  (u) => u.userId === user._id,
                );

                return found?.count || 0;
              }}
            />
          </div>
        )}

        {/* Applied Filter Chips Row */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" >

              <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, }} > Active Filters: </Typography>

              {filters.category && ( <Chip size="small" label={`Category: ${filters.category}`} onDelete={() => handleUpdate({ category: "" })} sx={{ bgcolor: "action.selected", fontWeight: 500 }} /> )}

              {filters.userId && ( <Chip size="small" label={`User: ${ filters.userId === "unassigned" ? "unassigned" : users.find((u) => u._id === filters.userId)?.name || "User" }`} onDelete={() => handleUpdate({ userId: "" })} sx={{ bgcolor: "action.selected", fontWeight: 500 }} /> )}

              {filters.startDate && ( <Chip size="small" icon={<FiCalendar size={12} />} label={`${dayjs(filters.startDate).format("MMM D")} - ${dayjs( filters.endDate, ).format("MMM D")}`} onDelete={() => handleUpdate({ startDate: "", endDate: "" })} sx={{ bgcolor: "action.selected", fontWeight: 500 }} /> )}

              {filters.unreadOnly && ( <Chip size="small" label="Unread" onDelete={() => handleUpdate({ unreadOnly: false })} sx={{ bgcolor: "primary.light", color: "primary.contrastText", fontWeight: 500, }} /> )}

              {filters.starred && ( <Chip size="small" label="Starred" onDelete={() => handleUpdate({ starred: false })} sx={{ bgcolor: "warning.light", color: "warning.contrastText", fontWeight: 500, }} /> )}

            </Stack>
          </>
        )}

        {/* Date Selection Menu */}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          TransitionComponent={Grow}
          // Remove standard background to allow for BackdropFilter
          PaperProps={{
            sx: {
              borderRadius: 4, // More rounded for a modern feel
              mt: 1.5,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: "none", // Removes MUI default elevation overlay
              overflow: "visible",
              "&:before": {
                // Optional: Speech bubble arrow
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                left: 24,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderLeft: "1px solid",
                borderTop: "1px solid",
                borderColor: "divider",
              },
            },
          }}
        >
          <Box sx={{ p: 2.5, width: 300 }}>
            <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5, ml: 0.5, }} > Quick Ranges </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
              }}
            >
              {[
                { l: "Today", v: 0 },
                { l: "Yesterday", v: -1 },
                { l: "3D", v: 3 },
                { l: "7D", v: 7 },
              ].map((range) => (
                <Button
                  key={range.l}
                  fullWidth
                  size="small"
                  onClick={() => applyPreset(range.v)}
                  sx={{
                    borderRadius: 2,
                    py: 0.8,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    border: "1px solid transparent",
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.15),
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {range.l}
                </Button>
              ))}
            </Box>

            <Divider sx={{ my: 2.5, opacity: 0.6 }} />

            <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5, ml: 0.5, }} > Custom Range </Typography>

            <Stack spacing={2}>
              <DatePicker
                label="Start Date"
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(val) =>
                  handleUpdate({
                    startDate: val
                      ? dayjs(val).startOf("day").toISOString()
                      : "",
                  })
                }
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    },
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(val) =>
                  handleUpdate({
                    endDate: val ? dayjs(val).endOf("day").toISOString() : "",
                  })
                }
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    },
                  },
                }}
              />
            </Stack>
          </Box>
        </Menu>
      </Paper>

      { <ManageCategoriesModal open={isCategoryModal} onClose={() => setIsCategoryModal(false)} /> }

        
    </LocalizationProvider>
  );
}
