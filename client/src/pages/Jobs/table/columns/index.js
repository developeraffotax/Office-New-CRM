import { acColumn } from "./acColumn"
import { actionsColumn } from "./actionsColumn"
import { assignColumn } from "./assignColumn"
import { budgetColumn } from "./budgetColumn"
import { clientNameColumn } from "./clientNameColumn"
import { clientTypeColumn } from "./clientTypeColumn"
import { companyNameColumn } from "./companyNameColumn"
import { completedJobFiledColumn } from "./completedJobFiledColumn"
import { completedJobPreparedColumn } from "./completedJobPreparedColumn"
import { completedJobReviewColumn } from "./completedJobReviewColumn"
import { deadlineColumn } from "./deadlineColumn"
import { departmentsColumn } from "./departmentsColumn"
import { feeColumn } from "./feeColumn"
import { hrsColumn } from "./hrsColumn"
import { idColumn } from "./idColumn"
import { jobDateColumn } from "./jobDateColumn"
import { jobStatusColumn } from "./jobStatusColumn"
import {   labelsColumn } from "./labelsColumn"
import { ownerColumn } from "./ownerColumn"
import { paidFeeColumn } from "./paidFeeColumn"
import { partnerColumn } from "./partnerColumn"
import { pocColumn } from "./pocColumn"
import { refColumn } from "./refColumn"
import { signupDateColumn } from "./signupDateColumn"
import { sourceColumn } from "./sourceColumn"
import { statusColumn } from "./statusColumn"
import { timerColumn } from "./timerColumn"
import { yearEndColumn } from "./yearEndColumn"






export const getJobsColumns = (ctx) => {
  const { auth, access, showUniqueClients } = ctx;

   

  // Always visible columns
  const baseColumns = [
    idColumn(),
    refColumn(),
    companyNameColumn(ctx),
    clientNameColumn(ctx),
    assignColumn(ctx),
    departmentsColumn(ctx),
    hrsColumn(ctx),
    yearEndColumn(ctx),
    deadlineColumn(ctx),
    jobDateColumn(ctx),
    statusColumn(ctx),
    jobStatusColumn(ctx),
    ownerColumn(ctx),
    budgetColumn(ctx),
    timerColumn(ctx),
    actionsColumn(ctx),
     
  ];

  // Start with base
  let columns = [...baseColumns];

  // Conditionally push extra columns
  if ((auth?.user?.role?.name === "Admin" || access.includes("Fee")) && !showUniqueClients) {
    columns.push(feeColumn(ctx));
  }

  if ((auth?.user?.role?.name === "Admin" || access.includes("Fee")) && showUniqueClients) {
    columns.push(paidFeeColumn(ctx));
  }

  if (auth?.user?.role?.name === "Admin" || access.includes("Source")) {
    columns.push(sourceColumn(ctx));
    columns.push(partnerColumn(ctx));
    columns.push(clientTypeColumn(ctx));
  }

 

  if (auth?.user?.role?.name === "Admin" || access.includes("Data")) {
    columns.push(pocColumn(ctx));
  }

  if (auth?.user?.role?.name === "Admin") {
    columns.push(acColumn(ctx));
     columns.push(signupDateColumn(ctx));
  }

   columns.push(labelsColumn(ctx))
  return columns;
};





















export const getJobsColumnsCompleted = (ctx) => {
  const { auth, access, showUniqueClients } = ctx;

   

  // Always visible columns
  const baseColumns = [
    idColumn(),
    refColumn(),
    companyNameColumn(ctx),
    clientNameColumn(ctx),
    assignColumn(ctx),
    departmentsColumn(ctx),
    hrsColumn(ctx),
    yearEndColumn(ctx),
    deadlineColumn(ctx),
    jobDateColumn(ctx),
    statusColumn(ctx),
    jobStatusColumn(ctx),
    ownerColumn(ctx),
    budgetColumn(ctx),

    completedJobPreparedColumn(ctx),
    completedJobReviewColumn(ctx),
    completedJobFiledColumn(ctx),
     
    
     
  ];

  // Start with base
  let columns = [...baseColumns];

  // Conditionally push extra columns
  if ((auth?.user?.role?.name === "Admin" || access.includes("Fee")) && !showUniqueClients) {
    columns.push(feeColumn(ctx));
  }

  if ((auth?.user?.role?.name === "Admin" || access.includes("Fee")) && showUniqueClients) {
    columns.push(paidFeeColumn(ctx));
  }

  if (auth?.user?.role?.name === "Admin" || access.includes("Source")) {
    columns.push(sourceColumn(ctx));
    columns.push(partnerColumn(ctx));
    columns.push(clientTypeColumn(ctx));
  }

 

  if (auth?.user?.role?.name === "Admin" || access.includes("Data")) {
    columns.push(pocColumn(ctx));
  }

  if (auth?.user?.role?.name === "Admin") {
    columns.push(acColumn(ctx));
     columns.push(signupDateColumn(ctx));
  }

   columns.push(labelsColumn(ctx))
  return columns;
};























export const getJobsColumnsInactive = (ctx) => {
  const { auth, access, showUniqueClients } = ctx;

   

  // Always visible columns
  const baseColumns = [
    idColumn(),
    refColumn(),
    companyNameColumn(ctx),
    clientNameColumn(ctx),
    assignColumn(ctx),
    departmentsColumn(ctx),
    hrsColumn(ctx),
    yearEndColumn(ctx),
    deadlineColumn(ctx),
    jobDateColumn(ctx),
    statusColumn(ctx),
    jobStatusColumn(ctx),
    ownerColumn(ctx),
    budgetColumn(ctx),
  
     
  ];


  return baseColumns;
};
