import { useEffect } from "react";
import JobWorkflowPanel from "./JobWorkflowPanel";
import MyWorkflowSteps from "./MyWorkflowSteps";
import WorkflowTemplatesPage from "./WorkflowTemplatesPage";
import { SlideOver, btnGhost } from "./ui/ui";

// Side drawer for one job's workflow (opened from the Actions column).
// `job` is the table row (client document). Pass null/undefined to keep it closed.
export function JobWorkflowDrawer({ job, users = [], canManage = false, onClose }) {
  if (!job) return null;
  const subtitle = [job.companyName, job.clientName, job.job?.jobName].filter(Boolean).join(" · ");
  return (
    <SlideOver title="Job workflow" subtitle={subtitle} onClose={onClose}>
      <JobWorkflowPanel clientId={job._id} users={users} canManage={canManage} />
    </SlideOver>
  );
}

// "My steps" drawer: open workflow steps assigned to the logged-in user.
export function MyStepsDrawer({ open, onClose, onOpenJob }) {
  if (!open) return null;
  return (
    <SlideOver title="My workflow steps" subtitle="Open steps assigned to you, across all jobs" onClose={onClose}>
      <MyWorkflowSteps onOpenJob={onOpenJob} />
    </SlideOver>
  );
}

// Full-screen overlay for building templates (admins).
export function WorkflowTemplatesOverlay({ open, onClose, users = [], jobTypes = [] }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Workflow templates" className="fixed inset-0 z-[600] overflow-y-auto bg-stone-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end">
          <button type="button" className={btnGhost} onClick={onClose}>
            Close
          </button>
        </div>
        <WorkflowTemplatesPage users={users} jobTypes={jobTypes} />
      </div>
    </div>
  );
}