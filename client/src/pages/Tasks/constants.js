export const columnData = [
  "jobRef",
  "companyName",
  "clientName",
  "Assign",
  "Department",
  "Hrs",
  "Year_End",
  "Deadline",
  "Job_Date",
  "Status",
  "Job_Status",
  "Owner",
  "Budget",
  "Timer",

  "Labels",
  "Fee",
  "Source",
  "ClientType",
  "POC",
  "AC",
  "SignUp_Date",
  "Actions",
  "Partner",
  "email",
  "phone",

  "jobPrepared",
  "jobReview",
  "jobFiled",
];

export const departments = [
  "All",
  "Bookkeeping",
  "Payroll",
  "Vat Return",
  "Personal Tax",
  "Accounts",
  "Company Sec",
  "Address",
];

export const dateStatus = ["Due", "Overdue", "Upcoming"];

 

export const statusInit = [
  "Quote",
  "Data",
  "Progress",
  // "Queries",
  "Revision",
  "Approval",
  "Submission",
  "Billing",
  "Feedback",
  "Missing Info",
];











export const DEFAULT_DATE_FILTERS = [
  "Expired",
  "Today",
  "Tomorrow",
  "In 7 days",
  "In 15 days",
  "In 30 Days",
  "In 60 Days",
  "Upcoming",
];









  export   const dotColors = {
  progress:  "bg-blue-500",
  completed: "bg-green-500",
  inactive:  "bg-red-500",

  due:  " bg-green-500",
  overdue: "  bg-red-500",
  upcoming:  " bg-gray-500",
};

export const textColors = {
  due:  "text-green-500 ",
  overdue: "text-red-500",
  upcoming:  "text-gray-500",



}



 

// used for api call
export const columnFieldMap = {
  _id: "_id",

  taskRef: "taskRef",
  projectName: "projectId",
  departmentName: "departmentId",
  task: "task",
  
  jobHolder: "jobHolder",
  lead: "lead",
  startDate: "startDate",
  deadline: "deadline",
  taskDate: "taskDate",
  datestatus: "dueStatus",  // due overdue
  
  estimate_Time: "estimate_Time",
  hours: "hours",

  labal: "labal",
  recurring: "recurring",

  taskStatus: "taskStatus"
 

  




  
};





