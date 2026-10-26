import { useEffect } from "react";
import MobileTasksView from "./MobileTasksView";
import { isAdmin } from "../../utlis/isAdmin";
import { isTeamLead } from "../../utlis/checkPermission";
import { statusArr } from "./constants";

const DEFAULT_PAGE = { pageIndex: 0, pageSize: 20 };

export default function AllTasksMobile({ c }) {
  const { auth, setPagination } = c;

  // "Load more" grows pageSize, so reset it on the way in and out
  // (otherwise desktop would inherit a huge page size).
  useEffect(() => {
    setPagination(DEFAULT_PAGE);
    return () => setPagination(DEFAULT_PAGE);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="relative h-full w-full overflow-auto">
      <MobileTasksView
        canManage={isAdmin(auth)}
        canDelete={isAdmin(auth)}
        canFilterUsers={isAdmin(auth) || isTeamLead(auth?.user)}
        tasksData={c.tasksData}
        loading={c.loading}
        rowCount={c.rowCount}
        setPagination={c.setPagination}
        status={c.status}
        setStatus={c.setStatus}
        columnFilters={c.columnFilters}
        setColumnFromOutsideTable={c.setColumnFromOutsideTable}
        onClearFilters={c.clearAllFilters}
        dueStatusFilter={c.dueStatusFilter}
        jobHolderFilter={c.jobHolderFilter}
        taskStatusFilter={c.taskStatusFilter}
        projectFilter={c.projectFilter}
        projects={c.projects}
        selectedUsers={c.selectedUsers}
        statusArr={statusArr}
        counts={{
          due: c.getdueStatusCounts,
          user: c.getuserTaskCounts,
          taskStatus: c.getTaskStatusTaskCounts,
          project: c.getProjectTaskCounts,
          total: c.taskStats?.totalTasks,
        }}
        savedFilters={c.savedFilters}
        activeFilter={c.activeFilter}
        onToggleSaved={c.toggleSavedFilter}
        searchValue={c.searchValue}
        onSearch={c.setSearch}
        runningTaskId={c.anyTimerRunning ? c.timerId : null}
        onOpenTask={c.openTaskDetail}
        onComment={c.openCommentFor}
        onAdd={() => c.setIsOpen(true)}
        onRefresh={() => {
          c.refetchTasks();
          c.getAllProjects();
        }}
        onStatusChange={c.handleMobileStatusChange}
        onComplete={c.handleCompleteStatus}
        onDelete={c.handleDeleteTaskConfirmation}
        adminActions={{
          onImport: c.importJobData,
          onExport: c.handleExportData,
          onAddLabel: () => c.setShowlabel(true),
          onAddDepartment: () => c.setOpenAddProject(true),
        }}
      />
    </div>
  );
}