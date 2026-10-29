// UserSelect.jsx
// Generic, compact, single-select user dropdown (avatar + name).
// Native-select feel: instant open, keyboard nav, typeahead, optional search.
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InputBase, Popover, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getUserColor } from "./KpiDashboard/utils/userColors";

const BLUE = "#1461de";
const CHECK_BLUE = "#3b82f6"; // blue-500, same as your text-blue-500 check
const NO_EXTRAS = [];

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

// Defaults — override with props if your user objects look different.
const defaultGetValue = (u) => u?.name;
const defaultGetLabel = (u) => u?.name ?? "";
const defaultGetImage = (u) =>
  u?.image || u?.avatar || u?.profileImage || u?.profilePic || u?.photo || undefined;

// ---------- static icons (plain SVG: much cheaper than MUI icons x every table row) ----------
const CHEVRON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
    style={{ flexShrink: 0, opacity: 0.8 }}>
    <path d="M5.5 8 12 14.5 18.5 8 20 9.5 12 17.5 4 9.5z" />
  </svg>
);
const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={CHECK_BLUE} aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

// ---------- styled pieces (static styles; state is driven by data-attributes, so no new CSS classes at runtime) ----------
const Trigger = styled("button")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "0 2px",
  minWidth: 0,
  boxSizing: "border-box",
  font: "inherit",
  fontSize: 13,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 6,
  border: "1px solid transparent",
  background: "transparent",
  color: theme.palette.text.primary,
  outline: "none",
  transition: "border-color 120ms ease, background-color 120ms ease",
  '&[data-variant="outlined"]': {
    borderColor: "#e5e7eb",
    background: "#f9fafb",
    "&:hover:not(:disabled)": { borderColor: BLUE },
    '&[aria-expanded="true"]': { borderColor: BLUE },
  },
  '&[data-variant="ghost"]': {
    "&:hover:not(:disabled)": { background: "rgba(0,0,0,0.04)" },
    '&[aria-expanded="true"]': { background: "rgba(20,97,222,0.06)" },
  },
  "&:disabled": { cursor: "default", opacity: 0.6 },
}));

const Label = styled("span")(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  '&[data-placeholder="true"]': { color: theme.palette.text.secondary },
}));

const AvatarRoot = styled("span")({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  overflow: "hidden",
  flexShrink: 0,
  color: "#fff",
  fontWeight: 700,
  lineHeight: 1,
  userSelect: "none",
  "& > img": { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
});

const ListBox = styled("div")({
  position: "relative", // needed for offsetTop-based scrolling
  overflowY: "auto",
  overscrollBehavior: "contain", // wheel at the end of the list must not scroll the page
  padding: "4px 0",
});

const Row = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 8,
  height: 32,
  padding: "0 10px",
  margin: "0 4px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
  "& .us-name": { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  // Default: text-gray-700
  '&[data-type="user"] .us-name': { color: "#374151" },
  '&:not([data-type="user"]) .us-name': { color: "#6b7280", fontStyle: "italic" },

  // Selected: bg-blue-100
  '&[data-selected="true"]': { background: "#dbeafe" },

  // Highlighted (hover / arrows / typing): bg-blue-600 text-white font-medium
  '&[data-highlighted="true"]:not([data-selected="true"])': { background: "#2563eb" },
  '&[data-highlighted="true"]:not([data-selected="true"]) .us-name': { color: "#fff", fontWeight: 500 },
});

const UserAvatar = memo(function UserAvatar({ name, src, size }) {
  return (
    <AvatarRoot style={{ width: size, height: size, fontSize: size * 0.45, background: getUserColor(name) }}>
      {initials(name)}
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={(e) => (e.currentTarget.parentNode.style.color = "transparent")}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : null}
    </AvatarRoot>
  );
});

// Memoized on primitives only: hovering / arrowing re-renders just 2 rows, not the whole list.
const OptionRow = memo(function OptionRow({ index, label, image, type, selected, highlighted, avatarSize }) {
  return (
    <Row
      role="option"
      aria-selected={selected}
      data-idx={index}
      data-type={type}
      data-selected={selected}
      data-highlighted={highlighted}
    >
      {type === "user" ? (
        <UserAvatar name={label} src={image} size={avatarSize} />
      ) : (
        <span style={{ width: avatarSize, flexShrink: 0 }} />
      )}
      <span className="us-name">{label}</span>
      {selected && CHECK}
    </Row>
  );
});

// ---------- pure helpers ----------
function buildOptions({ users, noneLabel, extraOptions, getOptionValue, getOptionLabel, getOptionImage }) {
  const list = [];
  if (noneLabel != null) list.push({ key: "__none", value: "", label: noneLabel, type: "none" });
  for (const u of users) {
    const label = getOptionLabel(u);
    list.push({ key: u?._id ?? label, value: getOptionValue(u), label, image: getOptionImage(u), type: "user" });
  }
  for (const o of extraOptions) list.push({ ...o, key: `extra-${o.value}`, type: "extra" });
  return list;
}

const filterOptions = (options, q) =>
  q ? options.filter((o) => o.type !== "none" && o.label.toLowerCase().includes(q)) : options;

const bestMatch = (list, q) => {
  const i = list.findIndex((o) => o.label.toLowerCase().startsWith(q));
  return i >= 0 ? i : 0;
};

// Native-select style typeahead: "a" -> first a-name, "a","a" -> next a-name, "ab" -> prefix match.
function typeaheadIndex(list, rawBuf, current) {
  let buf = rawBuf;
  if (buf.split("").every((c) => c === buf[0])) buf = buf[0];
  const n = list.length;
  const start = buf.length === 1 && list[current]?.label.toLowerCase().startsWith(buf) ? current + 1 : 0;
  for (let i = 0; i < n; i++) {
    const idx = (start + i) % n;
    const o = list[idx];
    if (o.type !== "none" && o.label.toLowerCase().startsWith(buf)) return idx;
  }
  return -1;
}

const isPrintable = (e) => e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

/**
 * Props
 * - users:            array of user objects
 * - value:            currently selected value ("" = nothing selected)
 * - onChange(value):  called with the option's value
 * - getOptionValue / getOptionLabel / getOptionImage: accessors for a user
 * - noneLabel:        if set, adds a first option with value "" (e.g. "Select", "Unassigned")
 * - extraOptions:     extra non-user options, e.g. [{ value: "empty", label: "Empty" }]  (hoist this array outside render)
 * - placeholder:      text shown on the trigger when nothing is selected
 * - searchable:       show the search box (default true). When false, typing a letter jumps to the user.
 * - showTriggerAvatar: show the avatar inside the closed trigger (default false)
 * - variant:          "outlined" (filters/headers) | "ghost" (table cells)
 * - height, avatarSize, menuMinWidth, menuMaxHeight, fullWidth, disabled, sx
 */
export default function UserSelect({
  users = [],
  value = "",
  onChange,
  getOptionValue = defaultGetValue,
  getOptionLabel = defaultGetLabel,
  getOptionImage = defaultGetImage,
  noneLabel,
  extraOptions = NO_EXTRAS,
  placeholder = "Select",
  searchable = true,
  searchPlaceholder = "Search…",
  showTriggerAvatar = false,
  variant = "outlined",
  height = 32,
  avatarSize = 20,
  menuMinWidth = 150,
  menuMaxHeight = 280,
  fullWidth = true,
  disabled = false,
  sx,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const listRef = useRef(null);
  const typeBuf = useRef("");
  const typeTimer = useRef(null);
  const onChangeRef = useRef(onChange);
  const highlightRef = useRef(0);
  onChangeRef.current = onChange;
  highlightRef.current = highlight;

  const open = Boolean(anchorEl);

  useEffect(() => () => clearTimeout(typeTimer.current), []);

  const optionArgs = { users, noneLabel, extraOptions, getOptionValue, getOptionLabel, getOptionImage };

  // The option list is only built while the menu is open -> closed cells stay very cheap.
  const options = useMemo(
    () => (open ? buildOptions(optionArgs) : NO_EXTRAS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, users, noneLabel, extraOptions, getOptionValue, getOptionLabel, getOptionImage]
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => filterOptions(options, q), [options, q]);
  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  // Trigger label: direct lookup, no option list needed.
  const selected = useMemo(() => {
    if (value === "" || value == null) return null;
    const u = users.find((x) => getOptionValue(x) === value);
    if (u) return { label: getOptionLabel(u), image: getOptionImage(u), type: "user" };
    const ex = extraOptions.find((o) => o.value === value);
    return { label: ex ? ex.label : String(value), type: "extra" };
  }, [users, extraOptions, value, getOptionValue, getOptionLabel, getOptionImage]);

  // ---------- scrolling (done by hand, ONLY for keyboard/typing/open — never for mouse hover) ----------
  const scrollToIndex = useCallback((idx, center = false) => {
    const list = listRef.current;
    const el = list?.children[idx];
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (center) {
      list.scrollTop = top - (list.clientHeight - el.offsetHeight) / 2;
    } else if (idx === 0) {
      list.scrollTop = 0;
    } else if (idx === list.children.length - 1) {
      list.scrollTop = list.scrollHeight;
    } else if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, []);

  // Callback ref: runs the moment the list mounts -> scroll the selected user into view on open.
  const setList = useCallback(
    (el) => {
      listRef.current = el;
      if (el) scrollToIndex(highlightRef.current, true);
    },
    [scrollToIndex]
  );

  const moveTo = (idx) => {
    highlightRef.current = idx; // keep in sync for rapid key repeat
    setHighlight(idx);
    scrollToIndex(idx);
  };

  // After filtering, keep the best match visible.
  useEffect(() => {
    if (open) scrollToIndex(highlightRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // ---------- open / close / choose ----------
  const pushTypeChar = (char) => {
    clearTimeout(typeTimer.current);
    typeBuf.current += char.toLowerCase();
    typeTimer.current = setTimeout(() => (typeBuf.current = ""), 700);
    return typeBuf.current;
  };

  const openMenu = (el, char = "") => {
    if (disabled) return;
    const opts = buildOptions(optionArgs);
    const current = Math.max(0, opts.findIndex((o) => o.value === value));
    let next = current;
    typeBuf.current = "";

    if (char) {
      if (searchable) {
        const nq = char.toLowerCase();
        next = bestMatch(filterOptions(opts, nq), nq);
        setQuery(char);
      } else {
        const i = typeaheadIndex(opts, pushTypeChar(char), current);
        if (i >= 0) next = i;
      }
    }
    highlightRef.current = next;
    setHighlight(next);
    setAnchorEl(el);
  };

  const close = useCallback(() => {
    setAnchorEl(null);
    setQuery("");
    typeBuf.current = "";
  }, []);

  const choose = useCallback(
    (opt) => {
      if (!opt) return;
      close();
      // Let the menu disappear first; the parent update (table re-render / API call) runs right after.
      setTimeout(() => onChangeRef.current?.(opt.value), 0);
    },
    [close]
  );

  // Menu is not scroll-locked (locking reflows the whole page = lag). Close it if anything outside it scrolls.
  useEffect(() => {
    if (!open) return undefined;
    const onScroll = (e) => {
      const t = e.target;
      if (t instanceof Element && t.closest(".MuiPopover-paper")) return;
      close();
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open, close]);

  // ---------- events ----------
  const onSearchChange = (e) => {
    const v = e.target.value;
    const nq = v.trim().toLowerCase();
    const next = nq
      ? bestMatch(filterOptions(options, nq), nq)
      : Math.max(0, options.findIndex((o) => o.value === value));
    highlightRef.current = next;
    setQuery(v);
    setHighlight(next);
  };

  const onMenuKeyDown = (e) => {
    const n = filteredRef.current.length;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveTo(Math.min(n - 1, highlightRef.current + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(Math.max(0, highlightRef.current - 1));
        break;
      case "Home":
        if (!searchable) { e.preventDefault(); moveTo(0); }
        break;
      case "End":
        if (!searchable) { e.preventDefault(); moveTo(Math.max(0, n - 1)); }
        break;
      case "Enter":
        e.preventDefault();
        choose(filteredRef.current[highlightRef.current]);
        break;
      case "Tab":
        close();
        break;
      default:
        if (!searchable && isPrintable(e)) {
          e.preventDefault();
          if (e.key === " " && !typeBuf.current) {
            choose(filteredRef.current[highlightRef.current]);
          } else {
            const i = typeaheadIndex(filteredRef.current, pushTypeChar(e.key), highlightRef.current);
            if (i >= 0) moveTo(i);
          }
        }
    }
  };

  const onTriggerKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu(e.currentTarget);
    } else if (isPrintable(e)) {
      e.preventDefault();
      openMenu(e.currentTarget, e.key);
    }
  };

  // Event delegation: one handler on the list instead of one per row.
  const rowIndex = (e) => {
    const row = e.target.closest?.("[data-idx]");
    return row ? Number(row.dataset.idx) : -1;
  };
  const onListMouseMove = (e) => {
    const i = rowIndex(e);
    if (i >= 0 && i !== highlightRef.current) {
      highlightRef.current = i;
      setHighlight(i);
    }
  };
  const onListClick = (e) => {
    const i = rowIndex(e);
    if (i >= 0) choose(filteredRef.current[i]);
  };

  // ---------- render ----------
  return (
    <>
      <Trigger
        type="button"
        data-variant={variant}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          openMenu(e.currentTarget);
        }}
        onKeyDown={onTriggerKeyDown}
        
        style={{ height, width: fullWidth ? "100%" : "auto" }}
        sx={sx}
      >
        {showTriggerAvatar && selected?.type === "user" && (
          <UserAvatar name={selected.label} src={selected.image} size={avatarSize} />
        )}
        <Label data-placeholder={!selected}>{selected ? selected.label : placeholder}</Label>
        {CHEVRON}
      </Trigger>

      {open && (
        <Popover
          open
          anchorEl={anchorEl}
          onClose={close}
          transitionDuration={0}
          disableScrollLock
          // Popover is portaled, but React events still bubble to the table row/cell.
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onMenuKeyDown}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: Math.max(anchorEl?.offsetWidth ?? 0, menuMinWidth),
                borderRadius: 2,
                border: "1px solid",
                borderColor: "#d3d3d3",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          {searchable && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 10px",
                height: 34,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <InputBase
                autoFocus
                fullWidth
                placeholder={searchPlaceholder}
                value={query}
                onChange={onSearchChange}
                inputProps={{ autoComplete: "off" }}
                sx={{ fontSize: 13 }}
              />
            </div>
          )}

          <ListBox
            ref={setList}
            role="listbox"
            style={{ maxHeight: menuMaxHeight }}
            onMouseMove={onListMouseMove}
            onClick={onListClick}
          >
            {filtered.length === 0 && (
              <div style={{ padding: "8px 12px", fontSize: 13, color: "rgba(0,0,0,0.6)" }}>No users found</div>
            )}
            {filtered.map((opt, i) => (
              <OptionRow
                key={opt.key}
                index={i}
                label={opt.label}
                image={opt.image}
                type={opt.type}
                selected={opt.type === "none" ? !selected : opt.value === value}
                highlighted={highlight === i}
                avatarSize={avatarSize}
              />
            ))}
          </ListBox>
        </Popover>
      )}
    </>
  );
}