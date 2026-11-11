export const columnData = [
  "jobRef",
  "companyName",
  "clientName",
  "Assign",
  "Department",
  "Hrs",
  "Year_End",
  "Deadline",
  "deadlineIn",
  "Job_Date",
  "Status",
  "Job_Status",
  "Lead",
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



 
export const COLUMN_LABELS = {
  jobRef: "jobRef",
  companyName: "companyName",
  clientName: "clientName",
  Assign: "Assign",
  Department: "Department",
  Hrs: "Hrs",
  Year_End: "Year_End",
  Deadline: "Deadline",
  deadlineIn: "deadlineIn",
  Job_Date: "AffotaxDLN",
  Status: "Status",
  Job_Status: "Job_Status",
  Lead: "Lead",
  Owner: "Owner",
  Budget: "Budget",
  Timer: "Timer",

  Labels: "Labels",
  Fee: "Fee",
  Source: "Source",
  ClientType: "ClientType",
  POC: "POC",
  AC: "AC",
  SignUp_Date: "SignUp_Date",
  Actions: "Actions",
  Partner: "Partner",
  email: "email",
  phone: "phone",

  jobPrepared: "Prepared By",
  jobReview: "Reviewed By",
  jobFiled: "Filed By",
};





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
  Lead: "leadUser",
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

  Timer: "_id",




  
};





