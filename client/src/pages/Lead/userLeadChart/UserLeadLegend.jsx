import { useMemo } from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";

const TARGET_SUFFIX = " (Target)";

/**
 * series: chartSeries from UserLeadChart -> [{ name, _color, _isTarget }]
 * hidden: Set of USER names currently hidden (hides actual + target together)
 * userTeamMap: { userName: teamName }
 */
export default function UserLeadLegend({
  series = [],
  hidden,
  onToggleOne,
  onToggleGroup,
  userTeamMap = {},
}) {
  // One entry per user (actual series only; targets follow their user)
  const groups = useMemo(() => {
    const byTeam = {};
    const ungrouped = [];

    series.forEach((s) => {
      if (s._isTarget || s.name.endsWith(TARGET_SUFFIX)) return;
      const entry = { name: s.name, color: s._color };
      const team = userTeamMap[s.name?.trim().toLowerCase()];
      if (team) {
        (byTeam[team] ||= { teamName: team, members: [] }).members.push(entry);
      } else {
        ungrouped.push(entry);
      }
    });

    const sorted = Object.values(byTeam).sort((a, b) =>
      a.teamName.localeCompare(b.teamName),
    );
    if (ungrouped.length) {
      sorted.push({
        teamName: sorted.length ? "Other" : null,
        members: ungrouped,
      });
    }
    return sorted;
  }, [series, userTeamMap]);

  if (groups.length === 0) return null;

  const isGrouped = groups.some((g) => g.teamName !== null);

  const renderChip = ({ name, color }) => {
    const isHidden = hidden.has(name);
    return (
      <Chip
        key={name}
        onClick={() => onToggleOne(name)}
        size="small"
        variant={isHidden ? "outlined" : "filled"}
        icon={
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: isHidden ? "rgba(0,0,0,0.25)" : color,
              ml: "8px !important",
            }}
          />
        }
        label={name}
        sx={{
          bgcolor: isHidden ? "transparent" : "rgba(0,0,0,0.04)",
          color: isHidden ? "text.disabled" : "text.primary",
          textDecoration: isHidden ? "line-through" : "none",
          cursor: "pointer",
          fontWeight: 500,
        }}
      />
    );
  };

  if (!isGrouped) {
    return (
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5, px: 1 }}>
        {groups.flatMap((g) => g.members).map(renderChip)}
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ mt: 1.5, px: 1 }}>
      {groups.map((group) => {
        const allHidden = group.members.every((m) => hidden.has(m.name));
        return (
          <Stack
            key={group.teamName}
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              onClick={() => onToggleGroup(group.members.map((m) => m.name))}
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.3,
                minWidth: 72,
                cursor: "pointer",
                color: allHidden ? "text.disabled" : "text.secondary",
              }}
            >
              {group.teamName}
            </Typography>
            {group.members.map(renderChip)}
          </Stack>
        );
      })}
    </Stack>
  );
}
