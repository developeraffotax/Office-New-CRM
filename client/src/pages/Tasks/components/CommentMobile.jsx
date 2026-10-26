import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import {
  FiEdit2, FiLoader, FiMessageCircle, FiPlus, FiSend, FiTrash2, FiZap,
} from "react-icons/fi";
import BottomSheet from "./BottomSheet";
import { useKeyboardInset } from "../hooks/useKeyboardInset";
 

const API = process.env.REACT_APP_API_URL;
const EMPTY = [];

const listUrl = (type, id) => {
  switch (type) {
    case "Jobs":  return `${API}/api/v1/client/job/comments/${id}`;
    case "Task":  return `${API}/api/v1/tasks/task/comments/${id}`;
    case "Lead":  return `${API}/api/v1/leads/comments/${id}`;
    case "Goals": return `${API}/api/v1/goals/get/comment/${id}`;
    default:      return `${API}/api/v1/tickets/ticket/comments/${id}`;
  }
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentionClass = "rounded bg-blue-50 px-1 py-0.5 font-semibold text-blue-700";
const clamp2 = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export default function CommentMobile({
  jobId,
  type,
  users = EMPTY, // array of user NAMES (same as JobCommentModal)
  getTasks1,
  active = true, // set false while the pane is hidden (tabs)
}) {
  const auth = useSelector((s) => s.auth.auth);
  const myId = auth?.user?.id;
  const keyboard = useKeyboardInset(active);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [mention, setMention] = useState(null); // { start, end, query }

  const [openId, setOpenId] = useState(null); // comment whose replies are expanded
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // quick replies
  const [templates, setTemplates] = useState([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrView, setQrView] = useState("list"); // "list" | "form"
  const [editingTpl, setEditingTpl] = useState(null);
  const [qrText, setQrText] = useState("");
  const [qrSaving, setQrSaving] = useState(false);

  const listRef = useRef(null);
  const taRef = useRef(null);
  const firstScroll = useRef(true);

  // ───────── mentions ─────────
  const sortedUsers = useMemo(
    () => [...users].filter(Boolean).sort((a, b) => b.length - a.length),
    [users],
  );

  const mentionRe = useMemo(
    () =>
      sortedUsers.length
        ? new RegExp(`(@(?:${sortedUsers.map(escapeRe).join("|")}))`, "g")
        : /(@\w+)/g,
    [sortedUsers],
  );

  // split() with one capture group → captured mentions sit at odd indexes
  const renderText = (str) =>
    str.split(mentionRe).map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className={mentionClass}>{part}</span>
      ) : (
        part
      ),
    );

  const suggestions = useMemo(() => {
    if (!mention) return [];
    const q = mention.query.toLowerCase();
    return sortedUsers
      .filter((n) => n.toLowerCase().split(" ").some((w) => w.startsWith(q)))
      .slice(0, 6);
  }, [mention, sortedUsers]);

  const mentionedUser = () => {
    let found = "";
    let at = -1;
    sortedUsers.forEach((n) => {
      const i = text.lastIndexOf(`@${n}`);
      if (i > at) {
        at = i;
        found = n;
      }
    });
    return found; // backend takes a single mentionUser
  };

  const handleChange = (e) => {
    const value = e.target.value;
    const pos = e.target.selectionStart ?? value.length;
    setText(value);
    const m = value.slice(0, pos).match(/(?:^|\s)@([^\s@]*)$/);
    setMention(m ? { query: m[1], end: pos, start: pos - m[1].length - 1 } : null);
  };

  const pickMention = (name) => {
    if (!mention) return;
    const before = text.slice(0, mention.start);
    const after = text.slice(mention.end);
    const inserted = `${before}@${name} `;
    setText(inserted + after);
    setMention(null);
    requestAnimationFrame(() => {
      taRef.current?.focus();
      taRef.current?.setSelectionRange(inserted.length, inserted.length);
    });
  };

  // ───────── data ─────────
  const fetchComments = useCallback(
    async ({ silent = false } = {}) => {
      if (!jobId) return;
      if (!silent) setLoading(true);
      try {
        const { data } = await axios.get(listUrl(type, jobId));
        setComments(data?.comments?.comments || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load comments");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [jobId, type],
  );

  useEffect(() => {
    setOpenId(null);
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/api/templates?type=${type}`);
        setTemplates(res.data.templates || []);
      } catch {
        toast.error("Failed to load quick replies");
      }
    })();
  }, [type]);

  // ───────── scrolling / sizing ─────────
  const scrollToBottom = useCallback((smooth) => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (!active || loading) return;
    scrollToBottom(!firstScroll.current);
    firstScroll.current = false;
  }, [active, loading, comments.length, scrollToBottom]);

  useEffect(() => {
    if (keyboard > 0) scrollToBottom(false);
  }, [keyboard, scrollToBottom]);

  // auto-grow textarea (min 40px so it never collapses while the tab is hidden)
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, Math.min(el.scrollHeight + 2, 120))}px`;
  }, [text, active]);

  // ───────── actions ─────────
  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return;
    if (!jobId) return toast.error("Job id is required!");
    setSending(true);
    try {
      await axios.post(`${API}/api/v1/comments/post/comment`, {
        comment: body,
        jobId,
        type,
        mentionUser: mentionedUser(),
      });
      setText("");
      setMention(null);
      await fetchComments({ silent: true });
      getTasks1?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    const body = replyText.trim();
    if (!body || replying) return;
    setReplying(true);
    try {
      await axios.put(`${API}/api/v1/comments/reply/comment`, {
        commentReply: body,
        jobId,
        commentId,
        type,
      });
      setReplyText("");
      await fetchComments({ silent: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reply");
    } finally {
      setReplying(false);
    }
  };

  const toggleReplies = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
    setReplyText("");
  };

  const toggleLike = async (c) => {
    const liked = c.likes?.includes(myId);
    const apply = (add) =>
      setComments((prev) =>
        prev.map((x) =>
          x._id === c._id
            ? {
                ...x,
                likes: add
                  ? [...(x.likes || []), myId]
                  : (x.likes || []).filter((i) => i !== myId),
              }
            : x,
        ),
      );

    apply(!liked); // optimistic
    try {
      await axios.put(
        `${API}/api/v1/comments/${liked ? "unlike" : "like"}/comment`,
        { jobId, commentId: c._id, type },
      );
    } catch (error) {
      apply(liked); // revert
      toast.error(error?.response?.data?.message || "Failed");
    }
  };

  // ───────── quick replies ─────────
  const closeQr = () => {
    setQrOpen(false);
    setQrView("list");
    setEditingTpl(null);
    setQrText("");
  };

  const openForm = (tpl = null) => {
    setEditingTpl(tpl);
    setQrText(tpl?.text || "");
    setQrView("form");
  };

  const saveTemplate = async () => {
    const body = qrText.trim();
    if (!body || qrSaving) return;
    setQrSaving(true);
    try {
      const { data } = await axios.post(`${API}/api/templates`, {
        userId: myId,
        type,
        text: body,
        templateId: editingTpl?._id,
      });
      setTemplates((prev) =>
        editingTpl
          ? prev.map((t) => (t._id === editingTpl._id ? data.template : t))
          : [...prev, data.template],
      );
      setQrView("list");
      setEditingTpl(null);
      setQrText("");
    } catch {
      toast.error("Failed to save quick reply");
    } finally {
      setQrSaving(false);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await axios.delete(`${API}/api/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error("Failed to delete quick reply");
    }
  };

  // tapping inserts into the box so it can be reviewed/edited before sending
  const insertTemplate = (t) => {
    setText((prev) => (prev ? `${prev}${/\s$/.test(prev) ? "" : " "}${t.text}` : t.text));
    closeQr();
    requestAnimationFrame(() => taRef.current?.focus());
  };

  const typeTemplates = templates.filter((t) => t.type === type);
  const canSend = !!text.trim() && !sending;

  // ───────── UI ─────────
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* thread */}
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-3"
      >
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 py-10 text-slate-400">
            <FiLoader className="animate-spin" size={20} />
            <p className="text-[12px] font-medium">Loading…</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiMessageCircle size={22} />
            </div>
            <p className="text-[14px] font-medium text-slate-600">No comments yet</p>
            <p className="mt-0.5 text-[12px] text-slate-400">Start the conversation below</p>
          </div>
        ) : (
          comments.map((c) => {
            const isMe = !!c?.user?._id && c.user._id === myId;
            const liked = c.likes?.includes(myId);
            const replies = c.commentReplies || [];
            const open = openId === c._id;

            return (
              <div key={c._id}>
                <div className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <img
                    src={c?.user?.avatar || "/profile1.jpeg"}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div
                    className={`flex min-w-0 max-w-[80%] flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="mb-0.5 flex items-center gap-1.5 px-1 text-[11px]">
                      <span className="font-semibold text-slate-700">
                        {isMe ? "You" : c?.user?.name}
                      </span>
                      <span className="text-slate-400">
                        {format(new Date(c.createdAt), "d MMM, h:mm a")}
                      </span>
                    </div>

                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-[14px] leading-snug ${
                        isMe
                          ? "rounded-br-md bg-slate-800 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-800"
                      }`}
                    >
                      {renderText(c.comment || "")}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleLike(c)}
                        className={`inline-flex h-8 items-center gap-1 rounded-full px-2 text-[12px] active:bg-slate-100 ${
                          liked ? "text-blue-600" : "text-slate-400"
                        }`}
                      >
                        {liked ? <AiFillLike size={15} /> : <AiOutlineLike size={15} />}
                        <span className="tabular-nums">{c.likes?.length || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleReplies(c._id)}
                        className={`inline-flex h-8 items-center rounded-full px-2 text-[12px] font-medium active:bg-slate-100 ${
                          open ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        Reply ({replies.length})
                      </button>
                    </div>
                  </div>
                </div>

                {open && (
                  <div className="ml-10 mt-2 space-y-2 border-l-2 border-slate-200 pl-3">
                    {replies.map((r) => (
                      <div key={r._id}>
                        <div className="mb-0.5 flex items-center gap-1.5 text-[11px]">
                          <img
                            src={r?.user?.avatar || "/profile1.jpeg"}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-semibold text-slate-700">{r?.user?.name}</span>
                          <span className="text-slate-400">
                            {format(new Date(r.createdAt), "d MMM, h:mm a")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words rounded-xl rounded-tl-sm bg-slate-100 px-3 py-2 text-[14px] leading-snug text-slate-800">
                          {r.reply}
                        </p>
                      </div>
                    ))}

                    <form onSubmit={(e) => handleReply(e, c._id)} className="flex items-center gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply…"
                        enterKeyHint="send"
                        className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-3.5 text-[16px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-300"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || replying}
                        className="flex h-10 min-w-[4rem] items-center justify-center rounded-full bg-slate-800 px-4 text-[13px] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {replying ? <FiLoader className="animate-spin" size={14} /> : "Reply"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-2 pt-2">
        {suggestions.length > 0 && (
          <ul className="mb-2 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => pickMention(name)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] text-slate-700 active:bg-slate-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                    {name.charAt(0)}
                  </span>
                  <span className="truncate font-medium">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-2">
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-600 active:bg-slate-100"
          >
            <FiZap size={12} />
            Quick replies
          </button>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            onChange={handleChange}
            placeholder="Write a comment… (@ to mention)"
            className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[16px] leading-snug text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send comment"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white active:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {sending ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
          </button>
        </div>
      </div>

      {/* quick replies sheet (list ⇄ form) */}
      <BottomSheet
        open={qrOpen}
        onClose={closeQr}
        zIndex={1100}
        title={
          qrView === "form"
            ? editingTpl ? "Edit quick reply" : "New quick reply"
            : "Quick replies"
        }
        footer={
          qrView === "list" ? (
            <div className="p-3">
              <button
                type="button"
                onClick={() => openForm(null)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-[14px] font-medium text-blue-600 active:bg-slate-50"
              >
                <FiPlus size={16} /> Add new quick reply
              </button>
            </div>
          ) : (
            <div className="flex gap-2 p-3">
              <button
                type="button"
                onClick={() => {
                  setQrView("list");
                  setEditingTpl(null);
                  setQrText("");
                }}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                disabled={!qrText.trim() || qrSaving}
                className="flex h-11 flex-[1.4] items-center justify-center rounded-xl bg-slate-800 text-[14px] font-medium text-white disabled:bg-slate-200 disabled:text-slate-400"
              >
                {qrSaving ? <FiLoader className="animate-spin" size={16} /> : "Save"}
              </button>
            </div>
          )
        }
      >
        {qrView === "list" ? (
          typeTemplates.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-slate-400">
              No quick replies yet
            </p>
          ) : (
            <ul>
              {typeTemplates.map((t) => (
                <li key={t._id} className="flex items-center gap-1 border-b border-slate-100 pl-4 pr-2">
                  <button
                    type="button"
                    onClick={() => insertTemplate(t)}
                    className="min-w-0 flex-1 py-3.5 text-left text-[15px] text-slate-800"
                  >
                    <span style={clamp2}>{t.text}</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={() => openForm(t)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => deleteTemplate(t._id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-red-400 active:bg-red-50"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="p-4">
            <textarea
              autoFocus
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              rows={5}
              placeholder="Enter your quick reply text here…"
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-[16px] outline-none focus:border-slate-300"
            />
          </div>
        )}
      </BottomSheet>
    </div>
  );
}