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

 




export const getTaskColumns = (ctx) => [
  idColumn(),
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
  timerColumn(ctx),
   
  actionsColumn(ctx),
  labelColumn(ctx),
  recurringColumn(ctx)
];









export const getCompletedTaskColumns = (ctx) => [
  idColumn(),
  departmentColumn(ctx),
  projectColumn(ctx),
  jobHolderColumn(ctx),
  taskColumn(ctx),
  hoursColumn(ctx),
  startDateColumn(ctx),
  deadlineColumn(ctx),
  taskDateColumnCompleted(ctx),
  dateStatusColumn(ctx),
  statusColumnCompleted(ctx),
  leadColumn(ctx),
  budgetColumn(ctx),
 
   
 
  labelColumn(ctx),
  recurringColumn(ctx)
];