// Place next to Filters.jsx (same folder — e.g. mail/shared/FiltersMobile.jsx)
// Same props as Filters.jsx. Internal state/handlers are duplicated on purpose
// (mirroring Filters.jsx exactly) rather than refactored into a shared hook,
// so Filters.jsx itself is left completely untouched.

import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import clsx from "clsx";

import {
  Paper,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Button,
  Divider,
  Box,
  Typography,
  Chip,
  IconButton,
  ToggleButton,
  Avatar,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { alpha } from "@mui/material/styles";
import { FiCalendar, FiFilter, FiMoreVertical } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import ManageCategoriesModal from "../categories/ManageCategoriesModal";
import InboxUserTabs from "./ui/InboxUserTabs";
import UserTabToggleButton from "./ui/UserTabToggleButton";
import ContextMenu from "./ui/ContextMenu";
import UnifiedThreadFilters from "./ui/LastMessageByDropdown";
import { hasSubrole } from "../../../utlis/checkPermission";
import { MdOutlineCreate } from "react-icons/md";

const DATE_PRESETS = [
  { label: "T", title: "Today", value: 0 },
  { label: "Y", title: "Yesterday", value: -1 },
  { label: "3D", title: "Last 3 Days", value: 3 },
  { label: "7D", title: "Last 7 Days", value: 7 },
  { label: "30D", title: "Last 30 Days", value: 30 },
];

export default function FiltersMobile({
  filters,
  setFilters,
  users = [],
  team = [],
  categories = [],
  fetchThreads,

  setIsComposeOpen,
}) {
  const {
    auth: { user },
  } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.name === "Admin";
  const isTeamLead = user?.isTeamLead;
  const hasPermission = isAdmin || isTeamLead;

  const hasUnassignedPermission = useMemo(
    () => hasSubrole(user, "Inbox", "Unassigned"),
    [user],
  );

  const [searchParams] = useSearchParams();
  const folder = searchParams.get("folder") || "inbox";
  const companyName = searchParams.get("companyName") || "affotax";

  const [inboxStats, setInboxStats] = useState(null);
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [isInboxUserTabs, setIsInboxUserTabs] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const prevSearchRef = useRef("");

  const [visibleTabs, setVisibleTabs] = useState(() => {
    const saved = localStorage.getItem("visible_inbox_tabs");
    if (saved) return JSON.parse(saved);
    return ["all", "unassigned", ...users.map((u) => u._id)];
  });

  useEffect(() => {
    if (!users.length) return;

    setVisibleTabs((prev) => {
      if (!prev?.length) {
        return ["all", "unassigned", ...users.map((u) => u._id)];
      }
      return prev;
    });
  }, [users]);

  const toggleTab = (id) => {
    let updated;
    if (visibleTabs.includes(id)) {
      updated = visibleTabs.filter((t) => t !== id);
    } else {
      updated = [...visibleTabs, id];
    }
    setVisibleTabs(updated);
    localStorage.setItem("visible_inbox_tabs", JSON.stringify(updated));
  };

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

    setFilters({
      ...filters,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      page: 1,
    });
  };

  const clearFilters = () => {
    const hasAll = visibleTabs.includes("all");
    const hasUnassigned = visibleTabs.includes("unassigned");

    const cleared = {
      category: "",
      userId: hasAll ? "" : hasUnassigned ? "unassigned" : "",
      unreadOnly: false,
      startDate: "",
      endDate: "",
      page: 1,
      search: "",
      lastMessageBy: "",
      starred: false,
      mailThreadId: "",
    };

    setFilters(cleared);
    setSearchInput("");
  };

  const handleUpdate = (updates) => {
    setFilters({ ...updates, page: 1 });
  };

  useEffect(() => {
    if (!hasPermission || !isInboxUserTabs) return;

    const fetchUserCounts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/gmail/mailbox-user-counts`,
          {
            params: {
              companyName: companyName,
              folder: folder,
              ...filters,
            },
          },
        );

        if (res.data?.success) {
          setInboxStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch user counts", err);
      }
    };

    fetchUserCounts();
  }, [filters, folder, companyName, isAdmin, isTeamLead, isInboxUserTabs]);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== (filters.search || "")) {
        setFilters({
          search: trimmed,
          page: 1,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, setFilters]);

  const hasActiveFilters =
    filters.category ||
    filters.userId ||
    filters.unreadOnly ||
    filters.starred ||
    filters.startDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {/* Top bar: search + quick actions */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ p: 1.5, marginLeft: 6 }}
        >
          {hasActiveFilters && (
            <IconButton
              onClick={clearFilters}
              title="Clear all filters"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
                flexShrink: 0,
                "&:active": {
                  borderColor: "error.main",
                  color: "error.main",
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                },
              }}
            >
              <IoClose size={16} />
            </IconButton>
          )}

          <Box sx={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="Search subject, email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                height: 40,
                width: "100%",
                padding: "0 36px 0 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                outline: "none",
                fontSize: "0.875rem",
              }}
            />
            {searchInput.trim() && (
              <IconButton
                size="small"
                onClick={() => setSearchInput("")}
                sx={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "grey.500",
                }}
              >
                <IoClose size={14} />
              </IconButton>
            )}
          </Box>

          <IconButton
            onClick={() => setSheetOpen(true)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: hasActiveFilters
                ? "primary.main"
                : "rgba(0,0,0,0.15)",
              color: hasActiveFilters ? "primary.main" : "text.secondary",
              bgcolor: hasActiveFilters
                ? (theme) => alpha(theme.palette.primary.main, 0.08)
                : "transparent",
              position: "relative",
            }}
          >
            <FiFilter size={17} />
            {hasActiveFilters && (
              <Box
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
            )}
          </IconButton>

          <IconButton
            onClick={() => fetchThreads?.()}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
              color: "text.secondary",
            }}
          >
            <AutorenewIcon fontSize="small" />
          </IconButton>

          <button
            onClick={() => setIsComposeOpen(true)}
            className="
              flex items-center justify-center
              bg-[#C2E7FF] hover:bg-[#B3D7EF] text-[#001D35]
              font-medium text-base rounded-2xl
              shadow-sm hover:shadow-md
              transition-all duration-200 ease-in-out
              w-[40px] h-[40px] shrink-0
            "
          >
            <MdOutlineCreate className="text-xl" />
          </button>

          <ContextMenu
            trigger={
              <button className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition shrink-0">
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

        {/* Active filter chips */}
        {/* {hasActiveFilters && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ px: 1.5, pb: 1.5, overflowX: "auto" }}
          >
            <button
              onClick={clearFilters}
              title="Clear all filters"
              className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-sm"
            >
              <IoClose className="h-4 w-4" />
            </button>

            {filters.category && (
              <Chip
                size="small"
                label={`Category: ${filters.category}`}
                onDelete={() => handleUpdate({ category: "" })}
                sx={{ bgcolor: "action.selected", fontWeight: 500, flexShrink: 0 }}
              />
            )}
            {filters.userId && (
              <Chip
                size="small"
                label={`User: ${
                  filters.userId === "unassigned"
                    ? "unassigned"
                    : users.find((u) => u._id === filters.userId)?.name || "User"
                }`}
                onDelete={() => handleUpdate({ userId: "" })}
                sx={{ bgcolor: "action.selected", fontWeight: 500, flexShrink: 0 }}
              />
            )}
            {filters.startDate && (
              <Chip
                size="small"
                icon={<FiCalendar size={12} />}
                label={`${dayjs(filters.startDate).format("MMM D")} - ${dayjs(
                  filters.endDate,
                ).format("MMM D")}`}
                onDelete={() => handleUpdate({ startDate: "", endDate: "" })}
                sx={{ bgcolor: "action.selected", fontWeight: 500, flexShrink: 0 }}
              />
            )}
            {filters.unreadOnly && (
              <Chip
                size="small"
                label="Unread"
                onDelete={() => handleUpdate({ unreadOnly: false })}
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              />
            )}
            {filters.starred && (
              <Chip
                size="small"
                label="Starred"
                onDelete={() => handleUpdate({ starred: false })}
                sx={{
                  bgcolor: "warning.light",
                  color: "warning.contrastText",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              />
            )}
          </Stack>
        )} */}

        {/* User tabs */}

        {/* {isInboxUserTabs && hasPermission && (
          <Box sx={{ px: 1.5, pb: 1.5, overflowX: "auto" }}>
            <InboxUserTabs
              droppableId="inbox_users"
              users={team.filter((u) => visibleTabs.includes(u._id))}
              showAll={isAdmin && visibleTabs.includes("all")}
              showUnassigned={
                (isAdmin || hasUnassignedPermission) && visibleTabs.includes("unassigned")
              }
              activeValue={filters.userId || ""}
              onChange={(userId) => setFilters({ userId, page: 1 })}
              getLabelFn={(u) => u.name}
              getCountFn={(u) => {
                if (!inboxStats) return 0;
                if (u === "all") return inboxStats.allCount || 0;
                if (u === "unassigned") return inboxStats.unassignedCount || 0;
                const found = inboxStats.userCounts?.find((x) => x.userId === u._id);
                return found?.count || 0;
              }}
            />
          </Box>
        )} */}
      </Paper>

      {/* Filter sheet */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
          sheetOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSheetOpen(false)}
      />
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          sheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none",
        )}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Filters
          </Typography>
          <IconButton size="small" onClick={() => setSheetOpen(false)}>
            <IoClose size={18} />
          </IconButton>
        </Stack>

        {/* ── USER (above category) ── */}
        {hasPermission && isInboxUserTabs && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontWeight: 700,
                mb: 1,
              }}
            >
              ASSIGNED TO
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                overflowX: "auto",
                pb: 0.5,
                mb: 2.5,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {/* All */}
              {isAdmin && visibleTabs.includes("all") && (
                <Chip
                  size="small"
                  label={`All${
                    inboxStats?.allCount ? ` · ${inboxStats.allCount}` : ""
                  }`}
                  onClick={() => handleUpdate({ userId: "" })}
                  sx={{
                    height: 32,
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    flexShrink: 0,
                    bgcolor:
                      (filters.userId || "") === ""
                        ? "primary.main"
                        : "action.hover",
                    color:
                      (filters.userId || "") === ""
                        ? "primary.contrastText"
                        : "text.primary",
                  }}
                />
              )}

              {/* Unassigned */}
              {(isAdmin || hasUnassignedPermission) &&
                visibleTabs.includes("unassigned") && (
                  <Chip
                    size="small"
                    label={`Unassigned${
                      inboxStats?.unassignedCount
                        ? ` · ${inboxStats.unassignedCount}`
                        : ""
                    }`}
                    onClick={() => handleUpdate({ userId: "unassigned" })}
                    sx={{
                      height: 32,
                      borderRadius: "999px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      flexShrink: 0,
                      bgcolor:
                        filters.userId === "unassigned"
                          ? "warning.main"
                          : "action.hover",
                      color:
                        filters.userId === "unassigned"
                          ? "warning.contrastText"
                          : "text.primary",
                    }}
                  />
                )}

              {/* Users */}
              {team
                .filter((u) => visibleTabs.includes(u._id))
                .map((u) => {
                  const count =
                    inboxStats?.userCounts?.find((x) => x.userId === u._id)
                      ?.count || 0;
                  const isActive = filters.userId === u._id;

                  return (
                    <Chip
                      key={u._id}
                      size="small"
                      avatar={
                        <Avatar
                          src={u?.avatar || ""}
                          sx={{
                            width: 22,
                            height: 22,
                            fontSize: "0.65rem",
                            bgcolor: isActive
                              ? "primary.contrastText"
                              : "grey.400",
                            color: isActive ? "primary.main" : "white",
                            fontWeight: 700,
                          }}
                        >
                          {!u?.avatar && u.name.charAt(0)}
                        </Avatar>
                      }
                      label={`${u.name.split(" ")[0]}${
                        count ? ` · ${count}` : ""
                      }`}
                      onClick={() => handleUpdate({ userId: u._id })}
                      sx={{
                        height: 32,
                        borderRadius: "999px",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                        bgcolor: isActive ? "primary.main" : "action.hover",
                        color: isActive
                          ? "primary.contrastText"
                          : "text.primary",
                        "& .MuiChip-avatar": { ml: "4px" },
                      }}
                    />
                  );
                })}
            </Box>
          </>
        )}

        {/* then existing CATEGORY section */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontWeight: 700,
            mb: 1,
          }}
        >
          CATEGORY
        </Typography>
        {/* ... rest of sheet unchanged ... */}

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontWeight: 700,
            mb: 1,
          }}
        >
          CATEGORY
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
          <Select
            value={filters.category || ""}
            displayEmpty
            onChange={(e) => handleUpdate({ category: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            {categories.map(({ name }) => (
              <MenuItem key={name} value={name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontWeight: 700,
            mb: 1,
          }}
        >
          DATE RANGE
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
            mb: 1.5,
          }}
        >
          {DATE_PRESETS.map((range) => {
            const isActive = (() => {
              if (!filters.startDate) return false;
              const now = dayjs();
              let expectedStart;
              if (range.value === 0) expectedStart = now.startOf("day");
              else if (range.value === -1)
                expectedStart = now.subtract(1, "day").startOf("day");
              else
                expectedStart = now.subtract(range.value, "day").startOf("day");
              return dayjs(filters.startDate).isSame(expectedStart, "minute");
            })();

            return (
              <Button
                key={range.label}
                title={range.title}
                onClick={() => applyPreset(range.value)}
                sx={{
                  minWidth: 0,
                  py: 1,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  border: "1px solid",
                  borderColor: isActive ? "primary.main" : "rgba(0,0,0,0.15)",
                  color: isActive ? "primary.main" : "text.secondary",
                  bgcolor: isActive
                    ? (theme) => alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                }}
              >
                {range.label}
              </Button>
            );
          })}
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
          <DatePicker
            label="Start Date"
            value={filters.startDate ? dayjs(filters.startDate) : null}
            onChange={(val) =>
              handleUpdate({
                startDate: val ? dayjs(val).startOf("day").toISOString() : "",
              })
            }
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
          <DatePicker
            label="End Date"
            value={filters.endDate ? dayjs(filters.endDate) : null}
            onChange={(val) =>
              handleUpdate({
                endDate: val ? dayjs(val).endOf("day").toISOString() : "",
              })
            }
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
        </Stack>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontWeight: 700,
            mb: 1,
          }}
        >
          QUICK FILTERS
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2.5 }}
        >
          <ToggleButton
            value="lastMessageClient"
            size="small"
            selected={filters.lastMessageBy === "client"}
            onChange={() =>
              handleUpdate({
                lastMessageBy:
                  filters.lastMessageBy === "client" ? "" : "client",
              })
            }
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              gap: 0.75,
              px: 1.5,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor:
                  filters.lastMessageBy === "client"
                    ? "primary.main"
                    : "grey.400",
                color: "white",
                fontSize: "0.6rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              C
            </Box>
            Client replied last
          </ToggleButton>

          <ToggleButton
            value="starred"
            size="small"
            selected={filters.starred === true}
            onChange={() => handleUpdate({ starred: !filters.starred })}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              gap: 0.75,
              px: 1.5,
            }}
          >
            {filters.starred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarOutlineIcon fontSize="small" />
            )}
            Starred
          </ToggleButton>

          <ToggleButton
            value="unread"
            size="small"
            selected={filters.unreadOnly}
            onChange={() => handleUpdate({ unreadOnly: !filters.unreadOnly })}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              gap: 0.75,
              px: 1.5,
            }}
          >
            <MarkEmailUnreadIcon fontSize="small" />
            Unread only
          </ToggleButton>

          <ToggleButton
            value="status"
            size="small"
            selected={filters.status === "progress"}
            onChange={() =>
              handleUpdate({
                status: filters.status === "progress" ? "" : "progress",
              })
            }
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              gap: 0.75,
              px: 1.5,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor:
                  filters.status === "progress" ? "primary.main" : "grey.400",
                color: "white",
                fontSize: "0.6rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              P
            </Box>
            In progress
          </ToggleButton>
        </Stack>

        <UnifiedThreadFilters filters={filters} handleUpdate={handleUpdate} />

        {hasPermission && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Team Visibility
              </Typography>
              <UserTabToggleButton
                active={isInboxUserTabs}
                onClick={() => setIsInboxUserTabs((prev) => !prev)}
              />
            </Stack>

            {(isAdmin || hasUnassignedPermission) && (
              <Stack spacing={0.5} sx={{ mb: 1 }}>
                {[
                  { id: "all", label: "All Conversations" },
                  { id: "unassigned", label: "Unassigned" },
                ].map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => toggleTab(item.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: "8px",
                      cursor: "pointer",
                      bgcolor: visibleTabs.includes(item.id)
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: visibleTabs.includes(item.id)
                          ? "primary.main"
                          : "action.disabled",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: visibleTabs.includes(item.id) ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ maxHeight: 260, overflowY: "auto" }}>
              {team.map((u) => {
                const count =
                  inboxStats?.userCounts?.find((us) => us.userId === u._id)
                    ?.count || 0;
                const isActive = visibleTabs.includes(u._id);

                return (
                  <Box
                    key={u._id}
                    onClick={() => toggleTab(u._id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: "8px",
                      cursor: "pointer",
                      mb: 0.5,
                      bgcolor: isActive ? "action.selected" : "transparent",
                    }}
                  >
                    <Avatar
                      src={u?.avatar || ""}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: "0.65rem",
                        bgcolor: isActive ? "primary.main" : "grey.400",
                        fontWeight: 700,
                      }}
                    >
                      {u?.avatar ? "" : u.name.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: isActive ? 600 : 400, flexGrow: 1 }}
                    >
                      {u.name} ({count})
                    </Typography>
                    {isActive && (
                      <Chip
                        label="Selected"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={clearFilters}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Clear All
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setSheetOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Apply
          </Button>
        </Stack>
      </div>

      <ManageCategoriesModal
        open={isCategoryModal}
        onClose={() => setIsCategoryModal(false)}
      />
    </LocalizationProvider>
  );
}
