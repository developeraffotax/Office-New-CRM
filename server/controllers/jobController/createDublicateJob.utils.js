// ---------- helpers ----------

// Same fields the old controller copied from req.body
export const COPY_FIELDS = [
  "clientName",
  "regNumber",
  "companyName",
  "email",
  "totalHours",
  "currentDate",
  "source",
  "clientType",
  "country",
  "fee",
  "ctLogin",
  "pyeLogin",
  "trLogin",
  "vatLogin",
  "authCode",
  "utr",
  "isActive",
  "totalTime",
];

export const pick = (obj, keys) =>
  Object.fromEntries(keys.map((key) => [key, obj[key]]));

// Snapshot of the job as it is NOW (before dates roll forward), marked completed
export const buildCompletedCopy = (existing, currentUser) => {
  const source = existing.toObject();

  return {
    ...pick(source, COPY_FIELDS),
    status: "completed",
    comments: source.comments,
    job: source.job,
    activities: [
      ...(source.activities || []),
      {
        user: currentUser._id,
        activity: `${currentUser.name} has completed this job!`,
      },
    ],
  };
};

// Pure function: returns the next-cycle dates, does not touch the document
export const getNextJobDates = (job) => {
  const yearEnd = new Date(job.yearEnd);
  const jobDeadline = new Date(job.jobDeadline);
  const workDeadline = new Date(job.workDeadline);
  const jobName = (job.jobName || "").trim();

  const addMonths = (date, n) => date.setMonth(date.getMonth() + n);
  const addDays = (date, n) => date.setDate(date.getDate() + n);

  switch (jobName) {
    case "Bookkeeping":
      addMonths(yearEnd, 1);
      addDays(jobDeadline, 15);
      addMonths(workDeadline, 1);
      break;

    case "Payroll":
      addMonths(yearEnd, 1);
      addDays(jobDeadline, 5);
      addMonths(workDeadline, 1);
      break;

    case "Vat Return":
      addMonths(yearEnd, 3);
      addDays(jobDeadline, 37);
      addMonths(workDeadline, 3);
      break;

    case "Personal Tax":
      addMonths(yearEnd, 12);
      addDays(jobDeadline, 301);
      break;

    case "Accounts":
    case "Company Sec":
      addMonths(yearEnd, 12);
      addMonths(jobDeadline, 12);
      break;

    case "Address":
      addMonths(yearEnd, 12);
      jobDeadline.setMonth(yearEnd.getMonth() - 1);
      workDeadline.setMonth(yearEnd.getMonth() - 1);
      break;

    default:
      addMonths(yearEnd, 12);
      addMonths(jobDeadline, 12);
      addMonths(workDeadline, 12);
  }

  return { yearEnd, jobDeadline, workDeadline };
};

