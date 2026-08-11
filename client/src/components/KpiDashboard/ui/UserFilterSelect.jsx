// UserFilterSelect.jsx
import { useState, useMemo } from "react";
import {
  Box, Popover, Stack, TextField, InputAdornment, Checkbox,
  Avatar, AvatarGroup, Typography, Button, Divider, List,
  ListItemButton, ListItemIcon, ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { getUserColor } from "../utils/userColors";
 

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

export default function UserFilterSelect({ users, selected, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [query, setQuery] = useState("");
  const open = Boolean(anchorEl);

  const filtered = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  const toggle = (name) =>
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);

  const selectedUsers = users.filter((u) => selected.includes(u.name));

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex", alignItems: "center", gap: 1, height: 40, px: 1.25,
          borderRadius: 2, border: "1px solid", minWidth: 168, cursor: "pointer",
          borderColor: open ? "#1461de" : "rgba(0,0,0,0.15)",
          bgcolor: open ? "rgba(20,97,222,0.04)" : "#fff",
          transition: "border-color 120ms ease, background-color 120ms ease",
          "&:hover": { borderColor: "#1461de" },
        }}
      >
        {selectedUsers.length === 0 ? (
          <>
            <PeopleAltRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">All users</Typography>
          </>
        ) : (
          <>
            <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 22, height: 22, fontSize: 10, fontWeight: 700, border: "2px solid #fff" } }}>
              {selectedUsers.map((u) => (
                <Avatar key={u._id} sx={{ bgcolor: getUserColor(u.name) }}>{initials(u.name)}</Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {selectedUsers.length === 1 ? selectedUsers[0].name : `${selectedUsers.length} users`}
            </Typography>
          </>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setQuery(""); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 0.5, width: 280, borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } } }}
      >
        <Box sx={{ p: 1.25, pb: 0.75 }}>
          <TextField
            autoFocus size="small" fullWidth placeholder="Search users…"
            value={query} onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment> }}
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, py: 0.5 }}>
          <Typography variant="caption" color="text.secondary">{selected.length} of {users.length} selected</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" sx={{ minWidth: 0, p: 0, fontSize: 12 }} onClick={() => onChange(users.map((u) => u.name))}>Select all</Button>
            <Button size="small" sx={{ minWidth: 0, p: 0, fontSize: 12 }} onClick={() => onChange([])} disabled={selected.length === 0}>Clear</Button>
          </Stack>
        </Stack>

        <Divider />

        <List dense sx={{ maxHeight: 280, overflowY: "auto", py: 0.5 }}>
          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>No users match "{query}"</Typography>
          )}
          {filtered.map((u) => (
            <ListItemButton key={u._id} onClick={() => toggle(u.name)} sx={{ borderRadius: 1, mx: 0.5, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Checkbox edge="start" size="small" checked={selected.includes(u.name)} tabIndex={-1} disableRipple />
              </ListItemIcon>
              <Avatar sx={{ width: 22, height: 22, fontSize: 10, fontWeight: 700, bgcolor: getUserColor(u.name), mr: 1 }}>
                {initials(u.name)}
              </Avatar>
              <ListItemText primaryTypographyProps={{ variant: "body2" }} primary={u.name} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
}