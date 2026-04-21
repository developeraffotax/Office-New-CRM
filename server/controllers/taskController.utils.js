

import mongoose from "mongoose";





const ALL_DATE_FILTERS = [
  "Expired",
  "Today",
  "Tomorrow",

  "Yesterday",
  "Last 7 days",
  "Last 15 days",
  "Last 30 Days",

  "In 7 days",
  "In 15 days",
  "In 30 Days",
  "In 60 Days",

  "This Month",
  "Last Month",

  "This Year",
  "Last Year",

  "Last 12 months",
  "Upcoming",
];


const getDatePresetRange = (preset) => {
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  switch (preset) {
    /* -------------------- PAST -------------------- */

    case "Expired":
      return {
        $lt: startOfToday,
      };

    case "Yesterday": {
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);

      return {
        $gte: yesterday,
        $lt: startOfToday,
      };
    }

    case "Last 7 days": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 7);

      return {
        $gte: start,
        $lt: startOfToday,
      };
    }

    case "Last 15 days": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 15);

      return {
        $gte: start,
        $lt: startOfToday,
      };
    }

    case "Last 30 Days": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 30);

      return {
        $gte: start,
        $lt: startOfToday,
      };
    }

    case "Last Month": {
      const start = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      return {
        $gte: start,
        $lt: end,
      };
    }

    case "Last Year": {
      const start = new Date(
        today.getFullYear() - 1,
        0,
        1
      );

      const end = new Date(
        today.getFullYear(),
        0,
        1
      );

      return {
        $gte: start,
        $lt: end,
      };
    }

    case "Last 12 months": {
      const start = new Date(startOfToday);
      start.setMonth(start.getMonth() - 12);

      return {
        $gte: start,
        $lt: startOfToday,
      };
    }

    /* -------------------- TODAY -------------------- */

    case "Today":
      return {
        $gte: startOfToday,
        $lt: endOfToday,
      };

    /* -------------------- FUTURE -------------------- */

    case "Tomorrow": {
      const tomorrow = new Date(startOfToday);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      return {
        $gte: tomorrow,
        $lt: nextDay,
      };
    }

    case "In 7 days": {
      const future = new Date(startOfToday);
      future.setDate(future.getDate() + 7);

      return {
        $gte: startOfToday,
        $lte: future,
      };
    }

    case "In 15 days": {
      const future = new Date(startOfToday);
      future.setDate(future.getDate() + 15);

      return {
        $gte: startOfToday,
        $lte: future,
      };
    }

    case "In 30 Days": {
      const future = new Date(startOfToday);
      future.setDate(future.getDate() + 30);

      return {
        $gte: startOfToday,
        $lte: future,
      };
    }

    case "In 60 Days": {
      const future = new Date(startOfToday);
      future.setDate(future.getDate() + 60);

      return {
        $gte: startOfToday,
        $lte: future,
      };
    }

    case "Upcoming":
      return {
        $gte: startOfToday,
      };

    /* -------------------- CURRENT PERIODS -------------------- */

    case "This Month": {
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
      );

      return {
        $gte: start,
        $lt: end,
      };
    }

    case "This Year": {
      const start = new Date(
        today.getFullYear(),
        0,
        1
      );

      const end = new Date(
        today.getFullYear() + 1,
        0,
        1
      );

      return {
        $gte: start,
        $lt: end,
      };
    }

    default:
      return null;
  }
};











const applyDateFilter = (
  query,
  field,
  value
) => {

  if (!value) return;

  let parsed;

  try {
    parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;
  } catch {
    parsed = value;
  }

  // ✅ Preset
  if (parsed?.type === "preset") {

    const presetQuery =
      getDatePresetRange(parsed.value);

    if (presetQuery) {
      query[field] = presetQuery;
    }

  }

  // ✅ Range
  else if (parsed?.type === "range") {

    const start = new Date(parsed.from);

    const end = new Date(parsed.to);
    end.setDate(end.getDate() + 1);

    query[field] = {
      $gte: start,
      $lt: end,
    };

  }

  // ✅ Single Date fallback
  else {

    const start = new Date(parsed);
    const end = new Date(parsed);

    end.setDate(end.getDate() + 1);

    query[field] = {
      $gte: start,
      $lt: end,
    };
  }
};












export const columnFieldMap = {
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

  




  
};





export const buildTasksQuery = (queryParams) => {

  const {
    _id,
    status = "progress",
    search,

    taskStatus,
    taskRef,
    projectId,
    task,

    jobHolder,
    lead,
    startDate,
    deadline,
    taskDate,
    dueStatus, // due status
 

    estimate_Time,
    hours,
    labal,
    recurring,

  
  } = queryParams;

  const query = {};

  
console.log("REQ.QUERY🧡", queryParams)

  if (status === "progress") {
    query.status =  { $ne: "completed" }
     

  }


  if (status === "completed") {
    query.status =  { $eq: "completed" }
  }

  
  

    if (taskStatus) {
    query.status = taskStatus;
  }

  
  

  /*
  ==========================================
  BASIC FILTERS
  ==========================================
  */
    if (_id) {
    query._id =  _id;
    
  }
  

    if (taskRef) {
      const cleaned = jobRef.toString().replace(/[^0-9]/g, "");

      if (cleaned) {
        const numericRef = Number(cleaned);

        if (!isNaN(numericRef)) {
          query.jobRef = numericRef;
        }
      }
    }


if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
  query.project = new mongoose.Types.ObjectId(projectId);
}

 
  if (jobHolder) {
    query.jobHolder = jobHolder;
  }

  if (lead) {
    query.lead = lead;
  }


  if(recurring) {
    query.recurring = recurring;
  }

  if (labal) {
    query["labal.name"] = labal;
  }

 
  







  /*
  ==========================================
  EMAIL / PHONE SEARCH
  ==========================================
  */

  if (task) {
    const normalizedTask = task.toLowerCase().trim();

    query.task = {
      $regex: normalizedTask,
      $options: "i",
    };
  }

 
  /*
  ==========================================
  ENTERPRISE DATE FILTERS
  ==========================================
  */

  applyDateFilter(
    query,
    "startDate",
    startDate
  );

    applyDateFilter(
    query,
    "deadline",
    deadline
  );

    applyDateFilter(
    query,
    "taskDate",
    taskDate
  );
 
  /*
  ==========================================
  DUE STATUS FILTER (SERVER SIDE)
  ==========================================
  */

if (dueStatus) {
  const normalizedDueStatus = dueStatus.toLowerCase().trim();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  /*
  ==========================================
  OVERDUE
  deadline < today
  ==========================================
  */

  if (normalizedDueStatus === "overdue") {
    query.deadline = {
      ...(query.deadline || {}),
      $lt: startOfToday,
    };
  }

  /*
  ==========================================
  DUE
  startDate <= today AND deadline >= today
  ==========================================
  */

else if (normalizedDueStatus === "due") {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  query.startDate = {
    ...(query.startDate || {}),
    $lte: endOfToday,   // startDate is today or earlier (cover full day)
  };

  query.deadline = {
    ...(query.deadline || {}),
    $gte: startOfToday,        // deadline is today midnight or later (not overdue)
  };
}

  /*
  ==========================================
  UPCOMING
  startDate > today
  ==========================================
  */

  else if (normalizedDueStatus === "upcoming") {
    query.startDate = {
      ...(query.startDate || {}),
      $gt: endOfToday,
    };
  }
}

  /*
  ==========================================
  GLOBAL SEARCH
  ==========================================
  */

if (search) {
  const normalizedSearch = search.trim();

  // Extract numbers for jobRef search
  const cleanedNumber = normalizedSearch.replace(/[^0-9]/g, "");
  const numericRef = Number(cleanedNumber);

  const orConditions = [
    {
      clientName: {
        $regex: normalizedSearch,
        $options: "i",
      },
    },
    {
      companyName: {
        $regex: normalizedSearch,
        $options: "i",
      },
    },
    {
      email: {
        $regex: normalizedSearch,
        $options: "i",
      },
    },
  ];

  // ✅ Add jobRef numeric search only if valid number
  if (cleanedNumber && !isNaN(numericRef)) {
    orConditions.push({
      jobRef: numericRef,
    });
  }

  query.$or = orConditions;
}


  console.log("THE TASK QUERY 🌹🧡🧡", query);
  return query;
};


























 








 