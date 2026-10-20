import { useRef, useState } from "react";
import {
  Box, Chip, Stack, Tooltip, Popover, TextField, IconButton, List,
  ListItemButton, ListItemText, Typography, CircularProgress,
} from "@mui/material";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { DATE_FILTER_OPTIONS } from "../constants"; // adjust path

const PAGE = "targets_dashboard";
const MAX_QUICK = 4;

const getView = (f) => f.filters?.[0]?.value || {};

const norm = (v = {}) => {
  const custom = v.dateFilter === "custom";
  return JSON.stringify({
    f: v.dateFilter ?? null,
    s: custom ? v.dateRange?.start ?? null : null, // ignore dates for quick ranges
    e: custom ? v.dateRange?.end ?? null : null,
    u: [...(v.users || [])].sort(),
    v: v.view ?? null,
    m: v.metric ?? null,
    c: v.chartType ?? null,
    t: !!v.showTargets,
    st: !!v.showStats,
  });
};

const isSameView = (saved, current) => norm(saved) === norm(current);

const summarize = (v = {}) => {
  const range =
    v.dateFilter === "custom"
      ? [v.dateRange?.start, v.dateRange?.end]
          .filter(Boolean)
          .map((d) => dayjs(d).format("D MMM YY"))
          .join(" – ")
      : DATE_FILTER_OPTIONS.find((o) => o.value === v.dateFilter)?.label;

  const users =
    v.users?.length === 1
      ? v.users[0]
      : v.users?.length
      ? `${v.users.length} users`
      : null;

  return [range, users, v.view, v.metric, v.chartType, v.showTargets ? "Targets" : null]
    .filter(Boolean)
    .join(" · ");
};

export default function SavedViews({ snapshot, onApply, savedFiltersHook }) {
  const { savedFilters, saveFilter, deleteFilter } = savedFiltersHook;
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const quick = savedFilters.slice(0, MAX_QUICK);
  const overflow = savedFilters.length - quick.length;

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Enter a view name");
    setSaving(true);
    try {
      await saveFilter(name.trim(), PAGE, [{ id: "targetsView", value: snapshot }]);
      toast.success("View saved");
      setName("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save view");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, f) => {
    e.stopPropagation();
    await deleteFilter(f._id);
  };

  return (
    <>
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <IconButton
          ref={btnRef}
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 6,
            color: open ? "primary.main" : "text.secondary",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <BookmarksOutlinedIcon fontSize="medium" />
        </IconButton>

        {quick.map((f) => {
          const view = getView(f);
          const active = isSameView(view, snapshot);
          return (
            <Tooltip key={f._id} title={summarize(view) || f.name} arrow>
              <Chip
                label={f.name}
                size="small"
                clickable
                color={active ? "primary" : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() => onApply(view, f)}
                sx={{ maxWidth: 140 }}
              />
            </Tooltip>
          );
        })}

        {overflow > 0 && (
          <Chip size="small" variant="outlined" clickable label={`+${overflow}`} onClick={() => setOpen(true)} />
        )}
      </Stack>

      <Popover
        open={open}
        anchorEl={btnRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 340, mt: 0.5 } } }}
      >
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Save current view as..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={handleSave} disabled={saving || !name.trim()}>
                  {saving ? <CircularProgress size={16} /> : <AddIcon fontSize="small" />}
                </IconButton>
              ),
            }}
          />
        </Box>

        <List dense disablePadding sx={{ maxHeight: 280, overflowY: "auto" }}>
          {savedFilters.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
              No saved views yet.
            </Typography>
          )}
          {savedFilters.map((f) => (
            <ListItemButton
              key={f._id}
              selected={isSameView(getView(f), snapshot)}
              onClick={() => {
                onApply(getView(f), f);
                setOpen(false);
              }}
              sx={{ "&:hover .del": { opacity: 1 } }}
            >
              <ListItemText
                primary={f.name}
                secondary={summarize(getView(f))}
                primaryTypographyProps={{ noWrap: true, fontWeight: 600 }}
                secondaryTypographyProps={{ noWrap: true }}
              />
              <IconButton className="del" size="small" sx={{ opacity: 0 }} onClick={(e) => handleDelete(e, f)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
}