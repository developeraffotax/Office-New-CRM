import { useState } from "react";
import toast from "react-hot-toast";
import { http, errMsg } from "../../aiApi.js";
import Button from "../../shared/ui/Button.jsx";
import { AlertIcon, CheckIcon, ShieldIcon, XIcon } from "../../shared/ui/Icons.jsx";

const RESULT = {
  done: { text: "Done.", cls: "text-emerald-700", icon: <CheckIcon className="h-4 w-4" /> },
  cancelled: { text: "Cancelled.", cls: "text-gray-600", icon: <XIcon className="h-4 w-4" /> },
  failed: { text: "Failed.", cls: "text-red-600", icon: <AlertIcon className="h-4 w-4" /> },
};

export default function ProposalCard({ proposal }) {
  const [state, setState] = useState("pending"); // pending | working | done | cancelled | failed
  const [acting, setActing] = useState(null); // which button shows the spinner
  const working = state === "working";

  const act = async (decision) => {
    setActing(decision);
    setState("working");
    try {
      const { data } = await http.post(`/actions/${proposal.id}/${decision}`);
      setState(data.status === "done" ? "done" : data.status === "cancelled" ? "cancelled" : "failed");
      if (data.status === "failed") toast.error(data.error || "That didn't work");
    } catch (e) {
      setState("pending");
      toast.error(errMsg(e));
    }
  };

  const result = RESULT[state];

  return (
    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
          <ShieldIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">Waiting for your confirmation</p>
          <p className="mt-0.5 text-gray-700">{proposal.summary}</p>
        </div>
      </div>
      {result ? (
        <p className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${result.cls}`}>
          {result.icon}
          {result.text}
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button loading={working && acting === "confirm"} disabled={working} onClick={() => act("confirm")}>Confirm</Button>
          <Button variant="ghost" loading={working && acting === "cancel"} disabled={working} onClick={() => act("cancel")}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
