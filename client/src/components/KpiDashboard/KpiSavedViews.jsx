import { useRef, useState } from "react";
import {
  Box, Button, Chip, Stack, Tooltip, Popover, TextField, IconButton, List,
  ListItemButton, ListItemText, Typography, CircularProgress,
} from "@mui/material";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";

const PAGE = "kpi_dashboard";
const MAX_QUICK = 4; // chips shown before collapsing into "+N"

const getView = (f) => f.filters?.[0]?.value || {};

const norm = (v = {}) =>
  JSON.stringify({
    s: v.dateRange?.start ?? null,
    e: v.dateRange?.end ?? null,
    src: v.source || "",
    u: [...(v.users || [])].sort(),
    c: v.chartType || null,
  });

// a = saved view, b = current snapshot
const isSameView = (a = {}, b = {}) => {
  if (norm(a) !== norm(b)) return false;

  // Only compare location if the saved view actually has it.
  // Older views saved before activeGroup/activeTab existed would
  // otherwise never highlight.
  if (a.activeGroup && a.activeGroup !== b.activeGroup) return false;
  if (a.activeTab && a.activeTab !== b.activeTab) return false;

  return true;
};

// "Leads › Won Leads" using the labels from TAB_GROUPS instead of raw keys
const describeLocation = (v, groups = []) => {
  const g = groups.find((x) => x.key === v.activeGroup);
  const t = g?.tabs?.find((x) => x.chartKey === v.activeTab);
  return [g?.label, t?.label].filter(Boolean).join(" › ");
};

const summarize = (v, groups) =>
  [
    v.dateRange?.label,
    v.source,
    v.users?.length ? `${v.users.length} user${v.users.length > 1 ? "s" : ""}` : null,
    v.chartType,
    describeLocation(v, groups),
  ]
    .filter(Boolean)
    .join(" · ");

export default function KpiSavedViews({ snapshot, onApply, savedFiltersHook, tabGroups  }) {
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
      await saveFilter(name.trim(), PAGE, [{ id: "kpiView", value: snapshot }]);
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
      borderRadius: 6, // square with slightly rounded corners; use 0 for sharp corners
       
       
      color: open ? "primary.main" : "text.secondary",
      "&:hover": {  backgroundColor: "action.hover" },
    }}
  >
    <BookmarksOutlinedIcon fontSize="medium" />
  </IconButton>


        {quick.map((f) => {
          const view = getView(f);
          const active = isSameView(view, snapshot);
          return (
            <Tooltip key={f._id} title={summarize(view, tabGroups) || f.name} arrow>
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
                secondary={summarize(getView(f, tabGroups))}
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