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

export const getTaskColumns = () => [
  idColumn(),
  refColumn(),
  departmentColumn(),
  projectColumn(),
  jobHolderColumn(),
  taskColumn(),
  hoursColumn(),
  startDateColumn(),
  deadlineColumn(),
  taskDateColumn(),
  dateStatusColumn(),
  statusColumn(),
  leadColumn(),
  budgetColumn(),
  timerColumn(),

  actionsColumn(),
  labelColumn(),
  recurringColumn(),
];

export const getCompletedTaskColumns = () => [
  idColumn(),
  refColumn(),
  departmentColumn(),
  projectColumn(),
  jobHolderColumn(),
  taskColumn(),
  hoursColumn(),
  startDateColumn(),
  deadlineColumn(),
  taskDateColumnCompleted(),
  dateStatusColumn(),
  statusColumnCompleted(),
  leadColumn(),
  budgetColumn(),

  labelColumn(),
  recurringColumn(),
];
