import { useState, useEffect } from "react";

// ─── ConfirmDialog Component ───────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onConfirm, onCancel, config = {} }) {
  const {
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger", // "danger" | "warning" | "info"
    detail = null,
  } = config;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variants = {
    danger:  { confirmBg: "#cf222e", confirmHover: "#a40e26", iconColor: "#cf222e" },
    warning: { confirmBg: "#9a6700", confirmHover: "#7d5300", iconColor: "#9a6700" },
    info:    { confirmBg: "#0969da", confirmHover: "#0550ae", iconColor: "#0969da" },
  };
  const v = variants[variant] || variants.danger;

  const icons = {
    danger: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
      </svg>
    ),
    warning: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
      </svg>
    ),
  };

  return (
    <>
      <style>{`
        .gh-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: gh-fade 0.1s ease;
        }
        .gh-backdrop {
          position: absolute; inset: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .gh-panel {
          position: relative;
          width: 100%; max-width: 440px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(140,149,159,0.2);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #1f2328;
          animation: gh-scale 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gh-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #d0d7de;
        }
        .gh-title {
          font-size: 14px; font-weight: 600;
          color: #1f2328; margin: 0;
          display: flex; align-items: center; gap: 8px;
        }
        .gh-icon { color: ${v.iconColor}; flex-shrink: 0; display: flex; }
        .gh-close {
          background: none; border: none; cursor: pointer;
          color: #636c76; padding: 4px; border-radius: 6px;
          display: flex; align-items: center;
          transition: background 0.1s, color 0.1s;
        }
        .gh-close:hover { background: #f6f8fa; color: #1f2328; }
        .gh-body { padding: 16px; }
        .gh-message { color: #1f2328; margin: 0; font-size: 14px; }
        .gh-detail {
          margin-top: 12px;
          padding: 8px 12px;
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
          font-size: 12px;
          color: #1f2328;
          word-break: break-all;
        }
        .gh-footer {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #d0d7de;
        }
        .gh-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 5px 16px;
          font-family: inherit; font-size: 14px; font-weight: 500;
          border-radius: 6px; cursor: pointer;
          transition: background 0.1s, border-color 0.1s, box-shadow 0.1s;
          line-height: 20px; white-space: nowrap;
          border: 1px solid;
        }
        .gh-btn:focus-visible {
          outline: 2px solid #0969da;
          outline-offset: 2px;
        }
        .gh-btn-cancel {
          background: #f6f8fa;
          border-color: rgba(31,35,40,0.15);
          color: #1f2328;
          box-shadow: 0 1px 0 rgba(31,35,40,0.04);
        }
        .gh-btn-cancel:hover {
          background: #f3f4f6;
          border-color: rgba(31,35,40,0.25);
        }
        .gh-btn-cancel:active { background: #ebecf0; }
        .gh-btn-confirm {
          background: ${v.confirmBg};
          border-color: rgba(31,35,40,0.15);
          color: #ffffff;
          box-shadow: 0 1px 0 rgba(31,35,40,0.1);
        }
        .gh-btn-confirm:hover { background: ${v.confirmHover}; }
        .gh-btn-confirm:active { opacity: 0.9; }

        @keyframes gh-fade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gh-scale { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="gh-overlay" role="dialog" aria-modal="true" aria-labelledby="gh-title">
        <div className="gh-backdrop" onClick={onCancel} />
        <div className="gh-panel">

          <div className="gh-header">
            <h2 className="gh-title" id="gh-title">
              <span className="gh-icon">{icons[variant]}</span>
              {title}
            </h2>
            <button className="gh-close" onClick={onCancel} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
              </svg>
            </button>
          </div>

          <div className="gh-body">
            <p className="gh-message">{message}</p>
            {detail && <div className="gh-detail">{detail}</div>}
          </div>

          <div className="gh-footer">
            <button className="gh-btn gh-btn-cancel" onClick={onCancel}>{cancelLabel}</button>
            <button className="gh-btn gh-btn-confirm" onClick={onConfirm} autoFocus>{confirmLabel}</button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── useConfirm Hook ───────────────────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, config: {}, resolve: null });

  const confirm = (config = {}) =>
    new Promise((resolve) => {
      setState({ isOpen: true, config, resolve });
    });

  const handleConfirm = () => {
    state.resolve(true);
    setState({ isOpen: false, config: {}, resolve: null });
  };

  const handleCancel = () => {
    state.resolve(false);
    setState({ isOpen: false, config: {}, resolve: null });
  };

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      config: state.config,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}

// ─── Usage ─────────────────────────────────────────────────────────────────────
//
// const { confirm, dialogProps } = useConfirm();
// <ConfirmDialog {...dialogProps} />
//
// const handleDelete = async (id, companyName) => {
//   const ok = await confirm({
//     title: "Delete configuration?",
//     message: "This will permanently remove the project configuration. This action cannot be undone.",
//     detail: companyName,
//     confirmLabel: "Delete",
//     variant: "danger",
//   });
//   if (!ok) return;
//   try {
//     await axios.delete(`${API_BASE}/${id}`);
//     const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-${companyName}`) || "{}");
//     if (saved._id === id) localStorage.removeItem(`${STORAGE_KEY}-${companyName}`);
//     toast.success("Project removed");
//     fetchProjects();
//   } catch (err) {
//     toast.error("Delete failed");
//   }
// };