import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";





export default function ChartLegend({ series = [], colors = [], userTeamMap = {}, chartRef , hidden,           
  onToggleOne,     
  onToggleGroup   }) {


  // const [hidden, setHidden] = useState(() => new Set());

  // Reset toggle state whenever the actual set of series changes
  // (new chartKey, user selection, breakdown switch, etc.) — stale
  // names in `hidden` would otherwise silently no-op on toggleSeries.
  // const seriesSignature = series.map((s) => s.name).join("|");
  // useEffect(() => {
  //   setHidden(new Set());
  // }, [seriesSignature]);

  // Group by team the same way UserFilterSelect does. Series with no
  // match in userTeamMap (e.g. metric series like "New Sales") fall
  // into an "Other" bucket, or render flat if nothing matched at all.
  const groups = useMemo(() => {
    const byTeam = {};
    const ungrouped = [];

    series.forEach((s, idx) => {
      const entry = { name: s.name, color: colors[idx % colors.length] };
      const teamName = userTeamMap[s.name];
      if (teamName) {
        if (!byTeam[teamName]) byTeam[teamName] = { teamName, members: [] };
        byTeam[teamName].members.push(entry);
      } else {
        ungrouped.push(entry);
      }
    });

    const sorted = Object.values(byTeam).sort((a, b) =>
      a.teamName.localeCompare(b.teamName)
    );
    if (ungrouped.length > 0) {
      sorted.push({ teamName: sorted.length ? "Other" : null, members: ungrouped });
    }
    return sorted;
  }, [series, colors, userTeamMap]);

  const isGrouped = groups.some((g) => g.teamName !== null);

   


  const toggleOne = (name) => {
    onToggleOne(name); // ChartPanel's effect handles the chart's showSeries/hideSeries
  };

  const toggleGroup = (members) => {
    onToggleGroup(members.map((m) => m.name));
  };

  if (series.length === 0) return null;

  const renderChip = ({ name, color }) => {
    const isHidden = hidden.has(name);
    return (
      <Chip
        key={name}
        onClick={() => toggleOne(name)}
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
              onClick={() => toggleGroup(group.members)}
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