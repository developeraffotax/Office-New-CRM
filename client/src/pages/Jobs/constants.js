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

// export const status = [
//   "Quote",
//   "Data",
//   "Progress",
//   // "Queries",
//   "Revision",
//   "Approval",
//   "Submission",
//   "Billing",
//   "Feedback",
//   "Missing Info",
//   "Inactive",
// ];

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








// used for api call
export const columnFieldMap = {
  _id: "_id",

  jobRef: "jobRef",
  clientName: "clientName",
  companyName: "companyName",
  Status: "dueStatus",
  
  Assign: "jobHolder",
  Owner: "lead",
  Year_End: "yearEnd",
  Deadline: "deadline",
  Job_Date: "jobDate",
  Job_Status: "jobStatus",
  Department: "jobName",
  
  Hrs: "totalHours",
  Budget: "totalTime",

  email: "email",
  phone: "phone",

  Labels: "label",

  Source: "source",
  Partner: "partner",
  ClientType: "clientType",

  AC: "activeClient",
  POC: "pocId",
  SignUp_Date: "signupDate",


  jobPrepared: "jobPrepared",
  jobReview: "jobReview",
  jobFiled: "jobFiled",

  




  
};





