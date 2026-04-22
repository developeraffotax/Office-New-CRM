import { mkConfig } from "export-to-csv";

export const colVisibility = {
  taskRef: true,
  departmentName: true,
  projectName: true,
  jobHolder: true,
  task: true,
  hours: true,
  startDate: true,
  deadline: true,
  taskDate: true,
  datestatus: true,

  taskStatus: true,
  lead: true,
  estimate_Time: true,
  timertracker: true,
  comments: true,

  actions: true,
  labal: true,
  recurring: true,
};

// CSV Configuration
export const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

 








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

export const statusArr = ["To do", "Progress", "Review", "Onhold"];









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


export const dotBorderColors = {
  progress:  "border-blue-500",
  completed: "border-green-500",
  inactive:  "border-red-500",

  due:       "border-green-500",
  overdue:   "border-red-500",
  upcoming:  "border-gray-500",
};

export const textColors = {

   progress:  "text-blue-500",
  completed: "text-green-500",
  inactive:  "text-red-500",


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





