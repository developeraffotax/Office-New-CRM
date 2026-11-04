import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { workflowApi, errMsg } from "../workflowApi";
import WorkflowUserSelect from "./WorkflowUserSelect";
import { Modal, btnPrimary, btnGhost } from "./ui";

// Moves one user's open (to do / in progress / blocked) steps to another user across all jobs.
export default function BulkReassignDialog({ users = [], onClose, onDone }) {
  const [fromUser, setFromUser] = useState(null);
  const [toUser, setToUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPreview(null);
    if (!fromUser || !toUser || fromUser === toUser) return;
    workflowApi
      .reassign({ fromUser, toUser, dryRun: true })
      .then(setPreview)
      .catch((e) => toast.error(errMsg(e)));
  }, [fromUser, toUser]);

  const run = async () => {
    setBusy(true);
    try {
      const res = await workflowApi.reassign({ fromUser, toUser });
      toast.success(`Moved ${res.steps} step${res.steps === 1 ? "" : "s"} across ${res.jobs} job${res.jobs === 1 ? "" : "s"}`);
      onDone?.(res);
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Reassign open steps"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={run} disabled={busy || !preview || preview.steps === 0}>
            {preview ? `Move ${preview.steps} step${preview.steps === 1 ? "" : "s"}` : "Move steps"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block font-medium text-stone-700">From</span>
          <WorkflowUserSelect users={users} value={fromUser} onChange={setFromUser} placeholder="Choose user" ariaLabel="From user" />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium text-stone-700">To</span>
          <WorkflowUserSelect users={users} value={toUser} onChange={setToUser} placeholder="Choose user" ariaLabel="To user" />
        </label>
        {preview && (
          <p className="rounded-md border border-orange-200 bg-orange-50 p-3 text-stone-800">
            {preview.steps === 0
              ? "That user has no open workflow steps."
              : `${preview.steps} open step${preview.steps === 1 ? "" : "s"} across ${preview.jobs} job${preview.jobs === 1 ? "" : "s"} will move. Completed steps stay as they are.`}
          </p>
        )}
      </div>
    </Modal>
  );
}