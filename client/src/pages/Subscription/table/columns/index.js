import createCompanyNameColumn from "./CompanyNameColumn";
import createClientColumn from "./ClientColumn";
import createAssignColumn from "./AssignColumn";
import createDepartmentsColumn from "./DepartmentsColumn";
import createBillingStartColumn from "./BillingStartColumn";
import createBillingEndColumn from "./BillingEndColumn";
import createDeadlineColumn from "./DeadlineColumn";
import createTimeColumn from "./TimeColumn";
import createStatusColumn from "./StatusColumn";
import createFeeColumn from "./FeeColumn";
import createNoteColumn from "./NoteColumn";
import createJobStatusColumn from "./JobStatusColumn";
import createOwnerColumn from "./OwnerColumn";
import createSubscriptionTypeColumn from "./SubscriptionTypeColumn";
import createDataLabelColumn from "./DataLabelColumn";
import createActionsColumn from "./ActionsColumn";
import createSourceColumn from "./SourceColumn";
import createCompletedAtColumn from "./CompletedAtColumn";
import createCompletedByColumn from "./CompletedByColumn";

export const getSubscriptionColumns = (ctx) => {
  const columns = [
    createCompanyNameColumn(),
    createClientColumn(),
    createAssignColumn(ctx),
    createDepartmentsColumn(),
    createBillingStartColumn(ctx),
    createBillingEndColumn(ctx),
    createDeadlineColumn(ctx),
    createTimeColumn(),
    createStatusColumn(ctx),
    createFeeColumn(ctx),
    createJobStatusColumn(ctx),
    createOwnerColumn(ctx),
    createSubscriptionTypeColumn(ctx),
    createDataLabelColumn(ctx),
    createSourceColumn(ctx),
    createActionsColumn(ctx),
    createNoteColumn(ctx),

     

    
     
  ];


  // if (ctx?.auth?.user?.role?.name === "Admin") {

 
  //   columns.push(createActionsColumn(ctx));
  // }


    if (ctx?.status === "completed") {

 
    columns.push(createCompletedAtColumn(ctx));
    columns.push(createCompletedByColumn(ctx));
  }

  return columns;
};

export {
  createCompanyNameColumn,
  createClientColumn,
  createAssignColumn,
  createDepartmentsColumn,
  createBillingStartColumn,
  createBillingEndColumn,
  createDeadlineColumn,
  createTimeColumn,
  createStatusColumn,
  createFeeColumn,
  createNoteColumn,
  createJobStatusColumn,
  createOwnerColumn,
  createSubscriptionTypeColumn,
  createDataLabelColumn,
  createActionsColumn,
  createSourceColumn,
};

export default getSubscriptionColumns;


