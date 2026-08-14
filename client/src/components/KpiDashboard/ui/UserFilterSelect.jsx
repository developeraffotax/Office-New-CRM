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

export default function UserFilterSelect({ users, teams = [], selected, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [query, setQuery] = useState("");
  const open = Boolean(anchorEl);

  // Group users by team. A user can show up here whether `user.team` came
  // back populated ({_id, name, ...}) or as a raw id — either way we
  // resolve it against the `teams` list. Users with no team (or a team
  // that isn't in the `teams` list, e.g. inactive) fall into "No Team".
  const groups = useMemo(() => {
    const teamNameById = Object.fromEntries(teams.map((t) => [t._id, t.name]));
    const byTeamId = {};
    const noTeam = [];

    users.forEach((u) => {
      const teamId = typeof u.team === "object" ? u.team?._id : u.team;
      const teamName = teamId ? teamNameById[teamId] : null;

      if (teamId && teamName) {
        if (!byTeamId[teamId]) {
          byTeamId[teamId] = { teamId, teamName, members: [] };
        }
        byTeamId[teamId].members.push(u);
      } else {
        noTeam.push(u);
      }
    });

    const sorted = Object.values(byTeamId).sort((a, b) =>
      a.teamName.localeCompare(b.teamName)
    );
    if (noTeam.length > 0) {
      sorted.push({ teamId: null, teamName: "No Team", members: noTeam });
    }
    return sorted;
  }, [users, teams]);

  // Search matches either a team name (showing all its members) or an
  // individual member's name (showing just the matches within that team).
  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return groups;

    return groups
      .map((g) => {
        const teamMatches = g.teamName.toLowerCase().includes(q);
        const members = teamMatches
          ? g.members
          : g.members.filter((u) => u.name.toLowerCase().includes(q));
        return { ...g, members };
      })
      .filter((g) => g.members.length > 0);
  }, [groups, query]);

  const toggle = (name) =>
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);

  // Clicking a team selects every member of that team; clicking again
  // (once all are already selected) clears just that team's members,
  // leaving any other selections from outside the team untouched.
  const toggleTeam = (members) => {
    const memberNames = members.map((u) => u.name);
    const allSelected = memberNames.every((n) => selected.includes(n));
    onChange(
      allSelected
        ? selected.filter((n) => !memberNames.includes(n))
        : [...new Set([...selected, ...memberNames])]
    );
  };

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
            autoFocus size="small" fullWidth placeholder="Search users or teams…"
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

        <List dense sx={{ maxHeight: 480, overflowY: "auto", py: 0.5 }}>
          {filteredGroups.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>No users match "{query}"</Typography>
          )}

          {filteredGroups.map((group) => {
            const memberNames = group.members.map((u) => u.name);
            const selectedCount = memberNames.filter((n) => selected.includes(n)).length;
            const allSelected = selectedCount === memberNames.length;
            const someSelected = selectedCount > 0 && !allSelected;

            return (
              <Box key={group.teamId ?? "no-team"}>
                <ListItemButton
                  onClick={() => toggleTeam(group.members)}
                  sx={{ borderRadius: 1, mx: 0.5, py: 0.25, bgcolor: "rgba(20,97,222,0.05)" }}
                >
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Checkbox
                      edge="start" size="small"
                      checked={allSelected}
                      indeterminate={someSelected}
                      tabIndex={-1} disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{
                      variant: "caption",
                      sx: { fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, color: "text.secondary" },
                    }}
                    primary={`${group.teamName} (${group.members.length})`}
                  />
                </ListItemButton>

                {group.members.map((u) => (
                  <ListItemButton
                    key={u._id}
                    onClick={() => toggle(u.name)}
                    sx={{ borderRadius: 1, mx: 0.5, ml: 2, py: 0.5, width: "calc(100% - 16px)" }}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Checkbox edge="start" size="small" checked={selected.includes(u.name)} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 10, fontWeight: 700, bgcolor: getUserColor(u.name), mr: 1 }}>
                      {initials(u.name)}
                    </Avatar>
                    <ListItemText primaryTypographyProps={{ variant: "body2" }} primary={u.name} />
                  </ListItemButton>
                ))}
              </Box>
            );
          })}
        </List>
      </Popover>
    </>
  );
}