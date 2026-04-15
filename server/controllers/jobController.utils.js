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
    case "Expired":
      return {
        $lt: startOfToday,
      };

    case "Today":
      return {
        $gte: startOfToday,
        $lt: endOfToday,
      };

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





export const buildJobsQuery = (queryParams) => {

  const {
    jobRef,

    search,
    clientName,
    companyName,
    dueStatus,

    jobHolder,
    lead,
    jobName,
    jobStatus,
    yearEnd,
    jobDate,
    deadline,

    email,
    phone,
    label,

    source,
    partner,
    clientType,

    activeClient

  } = queryParams;

  const query = {
    status: { $eq: "process" },
    "job.jobStatus": { $ne: "Inactive" },
  };

  console.log(queryParams);

  /*
  ==========================================
  BASIC FILTERS
  ==========================================
  */


    if (jobRef) {
      const cleaned = jobRef.toString().replace(/[^0-9]/g, "");

      if (cleaned) {
        const numericRef = Number(cleaned);

        if (!isNaN(numericRef)) {
          query.jobRef = numericRef;
        }
      }
    }


  if (companyName) {
    query.companyName = {
        $regex: companyName.trim(),
        $options: "i",
      }
  }

  if (clientName) {
    query.clientName = {
        $regex: clientName.trim(),
        $options: "i",
      }
  }

  if (jobHolder) {
    query["job.jobHolder"] = jobHolder;
  }

  if (lead) {
    query["job.lead"] = lead;
  }

  if (jobName) {
    query["job.jobName"] = jobName;
  }

  if (jobStatus) {
    query["job.jobStatus"] = jobStatus;
  }

  if (label) {
    query["label.name"] = label;
  }

  if(source) {
    query.source = source;
  }

  
  if(partner) {
    query.partner = partner;
  }

  
  if(clientType) {
    query.clientType = clientType;
  }

  if (activeClient) {
    query.activeClient = activeClient;
  }

  /*
  ==========================================
  EMAIL / PHONE SEARCH
  ==========================================
  */

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();

    query.email = {
      $regex: normalizedEmail,
      $options: "i",
    };
  }

  if (phone) {
    const normalizedPhone = phone.toLowerCase().trim();

    query.phone = {
      $regex: normalizedPhone,
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
    "job.yearEnd",
    yearEnd
  );

  applyDateFilter(
    query,
    "job.jobDeadline",
    deadline
  );

  applyDateFilter(
    query,
    "job.workDeadline",
    jobDate
  );

  /*
  ==========================================
  DUE STATUS FILTER (SERVER SIDE)
  ==========================================
  */

  if (dueStatus) {
    const normalizedDueStatus = dueStatus.toLowerCase().trim();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (normalizedDueStatus === "overdue") {

      // deadline < today

      query["job.jobDeadline"] = {
        ...(query["job.jobDeadline"] || {}),
        $lt: today,
      };

    }

    else if (normalizedDueStatus === "due") {

      // (yearEnd <= today AND deadline > today)
      // OR (deadline === today)

      query.$expr = {
        $or: [

          {
            $and: [
              {
                $lte: [
                  "$job.yearEnd",
                  today,
                ],
              },
              {
                $gt: [
                  "$job.jobDeadline",
                  today,
                ],
              },
            ],
          },

          {
            $eq: [
              {
                $dateTrunc: {
                  date: "$job.jobDeadline",
                  unit: "day",
                },
              },
              today,
            ],
          },

        ],
      };

    }

    else if (normalizedDueStatus === "upcoming") {

      // deadline > today AND yearEnd > today

      query.$expr = {
        $and: [
          {
            $gt: [
              "$job.jobDeadline",
              today,
            ],
          },
          {
            $gt: [
              "$job.yearEnd",
              today,
            ],
          },
        ],
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

  return query;
};