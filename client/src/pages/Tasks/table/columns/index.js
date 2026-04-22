import { actionsColumn } from "./actionsColumn";
 
import { dateStatusColumn } from "./dateStatusColumn";
import { deadlineColumn } from "./deadlineColumn";
import { departmentColumn } from "./departmentColumn";
import { budgetColumn } from "./budgetColumn";
import { hoursColumn } from "./hoursColumn";
import { idColumn } from "./idColumn";
import { jobHolderColumn } from "./jobHolderColumn";
import { labelColumn } from "./labelColumn";
import { leadColumn } from "./leadColumn";
import { projectColumn } from "./projectColumn";
import { startDateColumn } from "./startDateColumn";
import { statusColumn, statusColumnCompleted } from "./statusColumn";
import { taskColumn } from "./taskColumn";
import { timerColumn } from "./timerColumn";
import { recurringColumn } from "./recurringColumn";
import { taskDateColumn, taskDateColumnCompleted } from "./taskDateColumn";
import { refColumn } from "./refColumn";

 


export const getTaskColumns = (ctx) => {
  const columns = [
    idColumn(),
    refColumn(),
    departmentColumn(ctx),
    projectColumn(ctx),
    jobHolderColumn(ctx),
    taskColumn(ctx),
    hoursColumn(ctx),
    startDateColumn(ctx),
    deadlineColumn(ctx),
    taskDateColumn(ctx),
    dateStatusColumn(ctx),
    statusColumn(ctx),
    leadColumn(ctx),
    budgetColumn(ctx),
 
  ];

  // Add actions column only when not completed
  if (ctx.status !== "completed") {
    columns.push(timerColumn(ctx));
    columns.push(actionsColumn(ctx));
  }

  // Always append these at the end
  columns.push(
    labelColumn(ctx),
    recurringColumn(ctx)
  );

  return columns;
};






export const getCompletedTaskColumns = (ctx) => [
  idColumn(),
  refColumn(),
  departmentColumn(ctx),
  projectColumn(ctx),
  jobHolderColumn(ctx),
  taskColumn(ctx),
  hoursColumn(ctx),
  startDateColumn(ctx),
  deadlineColumn(ctx),
  // taskDateColumnCompleted(ctx),
  dateStatusColumn(ctx),
  statusColumnCompleted(ctx),
  leadColumn(ctx),
  budgetColumn(ctx),
 
   
 
  labelColumn(ctx),
  recurringColumn(ctx)
];