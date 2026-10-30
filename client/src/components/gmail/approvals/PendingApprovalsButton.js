// mail/approvals/PendingApprovalsButton.js
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCheckSquare } from "react-icons/fi";
import IconButtonWithBadge from "../shared/ui/IconButtonWithBadge"; // adjust path if needed

const API = `${process.env.REACT_APP_API_URL}/api/v1/gmail/auto-emails`;
const CHANGED_EVENT = "autoemail:changed";

// Call after approving/rejecting so every badge on the page updates immediately
export const notifyApprovalsChanged = () => window.dispatchEvent(new Event(CHANGED_EVENT));

export function usePendingApprovalsCount({ pollMs = 60_000 } = {}) {
  const [state, setState] = useState({ count: 0, canApprove: false });

  const refresh = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/pending-count`);
      setState({ count: data.count || 0, canApprove: !!data.canApprove });
    } catch {
      /* keep the last known value */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      if (!document.hidden) refresh(); // don't poll from background tabs
    }, pollMs);
    window.addEventListener(CHANGED_EVENT, refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener(CHANGED_EVENT, refresh);
    };
  }, [refresh, pollMs]);

  return { ...state, refresh };
}

export default function PendingApprovalsButton() {
  const navigate = useNavigate();
  const { count, canApprove } = usePendingApprovalsCount();

  if (!canApprove) return null; // only approvers see it

  return (
    <IconButtonWithBadge
      icon={FiCheckSquare}
      unreadCount={count}
      title={count ? `${count} pending approval${count > 1 ? "s" : ""}` : "Pending approvals"}
      onClick={() => navigate("/pending-approvals")}
    />
  );
}