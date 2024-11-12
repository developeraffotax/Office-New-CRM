import jobsModel from "../models/jobsModel.js";
import labelModel from "../models/labelModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import XLSX from "xlsx";
import { sendDatatoGoogleSheet } from "../utils/googleSheet.js";

// Create Job
export const createJob = async (req, res) => {
  try {
    const {
      clientName,
      regNumber,
      companyName,
      email,
      totalHours,
      currentDate,
      source,
      clientType,
      partner,
      country,
      fee,
      ctLogin,
      pyeLogin,
      trLogin,
      vatLogin,
      ctPassword,
      pyePassword,
      trPassword,
      vatPassword,
      authCode,
      utr,
      isActive,
      jobs,
    } = req.body;

    // Check for required fields
    if (!clientName) {
      return res.status(400).send({
        success: false,
        message: "Client name is required!",
      });
    }
    if (!companyName) {
      return res.status(400).send({
        success: false,
        message: "Company name is required!",
      });
    }

    if (jobs.length === 0) {
      return res.status(400).send({
        success: false,
        message: "At least one job is required!",
      });
    }

    const createdJobs = await Promise.all(
      jobs.map(async (job) => {
        const client = new jobsModel({
          clientName,
          regNumber,
          companyName,
          email,
          totalHours,
          currentDate: currentDate || undefined,
          source,
          clientType,
          partner,
          country,
          fee,
          ctLogin,
          pyeLogin,
          trLogin,
          vatLogin,
          ctPassword,
          pyePassword,
          trPassword,
          vatPassword,
          authCode,
          utr,
          isActive,
          job: {
            jobName: job.jobName,
            yearEnd: job.yearEnd || new Date().toISOString(),
            jobDeadline: job.jobDeadline || new Date().toISOString(),
            workDeadline: job.workDeadline || new Date().toISOString(),
            hours: job.hours,
            fee: job.fee,
            lead: job.lead,
            jobHolder: job.jobHolder,
          },
        });

        // Save the client with the current job
        return await client.save();
      })
    );

    return res.status(200).send({
      success: true,
      message: "New client created and jobs added successfully",
      jobs: createdJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while creating job!",
      error: error.message,
    });
  }
};

// Get All Clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await jobsModel
      .find({ status: { $ne: "completed" } })
      .select(
        "clientName companyName email fee currentDate totalHours totalTime job.jobName job.yearEnd job.jobDeadline job.workDeadline job.jobStatus job.lead job.jobHolder comments._id comments.status label source data"
      )
      .populate("data");

    res.status(200).send({
      success: true,
      message: "All clients",
      clients: clients,
    });

    sendDatatoGoogleSheet();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all job!",
      error: error,
    });
  }
};
// Get Ticket Clients
export const getTicketClients = async (req, res) => {
  try {
    // const clients = await jobsModel
    //   .find({ status: { $ne: "completed" } })
    //   .select("clientName companyName ");
    const uniqueCompanies = await jobsModel.aggregate([
      {
        $match: { status: { $ne: "completed" } },
      },
      {
        $group: {
          _id: "$companyName",
          clientName: { $first: "$clientName" },
          id: { $first: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          companyName: "$_id",
          clientName: 1,
          id: 1,
        },
      },
    ]);

    res.status(200).send({
      success: true,
      message: "All clients",
      clients: uniqueCompanies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all job!",
      error: error,
    });
  }
};

// Update Client Status
export const updateStatus = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).send({
        success: false,
        message: "Status is required!",
      });
    }

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { "job.jobStatus": status } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Job status updated successfully!",
      clientJob: clientJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job status !",
      error: error,
    });
  }
};

// Update Client Lead
export const updateLead = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { lead } = req.body;
    if (!lead) {
      return res.status(400).send({
        success: false,
        message: "Lead user is required!",
      });
    }

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { "job.lead": lead } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Lead user updated successfully!",
      clientJob: clientJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job lead !",
      error: error,
    });
  }
};

// Update Job Holder
export const updateJobHolder = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { jobHolder } = req.body;
    if (!jobHolder) {
      return res.status(400).send({
        success: false,
        message: "Job Holder is required!",
      });
    }

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { "job.jobHolder": jobHolder } },
      { new: true }
    );

    // Create Notification
    const user = await userModel.findOne({ name: jobHolder });
    if (!user) {
      res.status(200).send({
        success: true,
        message: "Job holder updated successfully!",
        clientJob: clientJob,
      });

      return;
    }

    const notification = await notificationModel.create({
      title: "New Job Assigned",
      redirectLink: "/job-planning",
      description: `${req.user.user.name} assign a new job of "${clientJob.job.jobName}"`,
      taskId: `${clientJob._id}`,
      userId: user._id,
    });

    res.status(200).send({
      success: true,
      message: "Job holder updated successfully!",
      clientJob: clientJob,
      notification: notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job holder !",
      error: error,
    });
  }
};

// Delete Client Jobs
export const deleteClientJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const isExisting = await jobsModel.findById({ _id: jobId });

    if (!isExisting) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    await jobsModel.findByIdAndDelete({
      _id: isExisting._id,
    });

    res.status(200).send({
      success: true,
      message: " Job delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete job !",
      error: error,
    });
  }
};

// Get Single Client Job
export const singleClientJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientJob = await jobsModel.findById({ _id: jobId });

    if (!clientJob) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    } else {
      res.status(200).send({
        success: true,
        clientJob: clientJob,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single job!",
      error: error,
    });
  }
};

// Get Client with all jobs
export const getClientWithJobs = async (req, res) => {
  try {
    const { companyName } = req.query;

    if (!companyName) {
      return res.status(400).send({
        success: false,
        message: "Company Name is required!",
      });
    }

    const clientJobs = await jobsModel
      .find({ companyName: companyName, status: { $ne: "completed" } })
      .select("job");

    console.log("clientJobs", clientJobs);

    if (!clientJobs) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    } else {
      res.status(200).send({
        success: true,
        clientJobs: clientJobs,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single job!",
      error: error,
    });
  }
};

// Update Client Jobs

export const updateClientJob = async (req, res) => {
  try {
    const {
      clientName,
      regNumber,
      companyName,
      email,
      totalHours,
      currentDate,
      source,
      clientType,
      partner,
      country,
      fee,
      ctLogin,
      pyeLogin,
      trLogin,
      vatLogin,
      authCode,
      ctPassword,
      pyePassword,
      trPassword,
      vatPassword,
      utr,
      isActive,
      jobs,
    } = req.body;

    // Validation
    if (!clientName) {
      return res.status(400).send({
        success: false,
        message: "Client name is required!",
      });
    }
    if (!companyName) {
      return res.status(400).send({
        success: false,
        message: "Company name is required!",
      });
    }
    if (!jobs || jobs.length === 0) {
      return res.status(400).send({
        success: false,
        message: "At least one job is required!",
      });
    }

    for (const jobData of jobs) {
      if (jobData.clientId) {
        await jobsModel.findByIdAndUpdate(
          jobData.clientId,
          {
            clientName,
            regNumber,
            companyName,
            email,
            totalHours,
            currentDate,
            source,
            clientType,
            partner,
            country,
            fee,
            ctLogin,
            pyeLogin,
            trLogin,
            vatLogin,
            ctPassword,
            pyePassword,
            trPassword,
            vatPassword,
            authCode,
            utr,
            isActive,
            job: jobData,
          },
          { new: true }
        );
      } else {
        await jobsModel.create({
          clientName,
          regNumber,
          companyName,
          email,
          totalHours,
          currentDate,
          source,
          clientType,
          partner,
          country,
          fee,
          ctLogin,
          pyeLogin,
          trLogin,
          vatLogin,
          ctPassword,
          pyePassword,
          trPassword,
          vatPassword,
          authCode,
          utr,
          isActive,
          job: jobData,
        });
      }
    }

    res.status(200).send({
      success: true,
      message: "Client job(s) updated successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating client job(s)!",
      error: error.message,
    });
  }
};

// Update Jobs Year_end || jobDeadline || currentDate Date
export const updateDates = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { yearEnd, jobDeadline, currentDate } = req.body;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    let clientJob;

    if (yearEnd) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { "job.yearEnd": yearEnd } },
        { new: true }
      );
    }
    if (jobDeadline) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { "job.jobDeadline": jobDeadline } },
        { new: true }
      );
    }
    if (currentDate) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { currentDate: currentDate } },
        { new: true }
      );
    }

    res.status(200).send({
      success: true,
      message: "Date updated successfully!",
      clientJob: clientJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Yearend date !",
      error: error,
    });
  }
};

// Get Single Client Comments
export const singleClientComments = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientComments = await jobsModel
      .findById({ _id: jobId })
      .select("comments");

    res.status(200).send({
      success: true,
      comments: clientComments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single job!",
      error: error,
    });
  }
};

// Get Only Status (Completed) Jobs
export const getClientJobs = async (req, res) => {
  try {
    const clients = await jobsModel.find({ status: "completed" });

    res.status(200).send({
      success: true,
      message: "All client jobs whose status is completed!",
      clients: clients,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all job!",
      error: error,
    });
  }
};

// Dublicate Job
export const createDublicateJob = async (req, res) => {
  try {
    const {
      _id,
      clientName,
      regNumber,
      companyName,
      email,
      totalHours,
      currentDate,
      source,
      clientType,
      country,
      fee,
      ctLogin,
      pyeLogin,
      trLogin,
      vatLogin,
      authCode,
      utr,
      isActive,
      totalTime,
      comments,
      job,
    } = req.body;

    // Check for required fields
    if (!clientName) {
      return res.status(400).send({
        success: false,
        message: "Client name is required!",
      });
    }
    if (!companyName) {
      return res.status(400).send({
        success: false,
        message: "Company name is required!",
      });
    }

    const clientJob = await jobsModel.create({
      clientName,
      regNumber,
      companyName,
      email,
      totalHours,
      currentDate,
      source,
      clientType,
      country,
      fee,
      ctLogin,
      pyeLogin,
      trLogin,
      vatLogin,
      authCode,
      utr,
      isActive,
      status: "completed",
      totalTime,
      comments,
      job,
    });

    const isExisting = await jobsModel.findById({ _id: _id });

    let yearEnd = new Date(isExisting.job.yearEnd);
    let jobDeadline = new Date(isExisting.job.jobDeadline);
    let currDate = new Date(isExisting.currentDate);

    if (
      isExisting.job.jobName === "Bookkeeping" ||
      isExisting.job.jobName === "Payroll"
    ) {
      // Add 1 month
      yearEnd.setMonth(yearEnd.getMonth() + 1);
      // Add 15 days if Bookkeeping, 5 days if Payroll
      if (isExisting.job.jobName === "Bookkeeping") {
        jobDeadline.setDate(jobDeadline.getDate() + 15);
      } else if (isExisting.job.jobName === "Payroll") {
        jobDeadline.setDate(jobDeadline.getDate() + 5);
      }
      currDate.setMonth(currDate.getMonth() + 1); // Add 1 month
    } else if (isExisting.job.jobName === "Vat Return") {
      // Add 3 months
      yearEnd.setMonth(yearEnd.getMonth() + 3);
      jobDeadline.setDate(jobDeadline.getDate() + 37); // Add 37 days
      currDate.setMonth(currDate.getMonth() + 3); // Add 3 months
    } else {
      // Add 12 months (1 year)
      yearEnd.setMonth(yearEnd.getMonth() + 12);

      // Specific adjustments for different job names
      if (isExisting.job.jobName === "Personal Tax") {
        jobDeadline.setDate(jobDeadline.getDate() + 301); // Add 301 days
      } else if (isExisting.job.jobName === "Accounts") {
        jobDeadline.setMonth(jobDeadline.getMonth() + 12); // Add 12 months
      } else if (isExisting.job.jobName === "Company Sec") {
        jobDeadline.setDate(jobDeadline.getMonth() + 12); // Add 1 year
      } else if (isExisting.job.jobName === "Address") {
        // Subtract 1 month from yearEnd for jobDeadline and currDate
        jobDeadline.setMonth(yearEnd.getMonth() - 1);
        currDate.setMonth(yearEnd.getMonth() - 1);
      } else {
        // Default case for other job names: add 12 months to jobDeadline and currDate
        jobDeadline.setMonth(jobDeadline.getMonth() + 12);
        currDate.setMonth(currDate.getMonth() + 12);
      }
    }

    // if (
    //   isExisting.job.jobName === "Bookkeeping" ||
    //   isExisting.job.jobName === "Payroll"
    // ) {
    //   // Add 1 month
    //   yearEnd.setMonth(yearEnd.getMonth() + 1); // 1 month
    //   jobDeadline.setMonth(jobDeadline.getMonth() + 1); // if Bookkeeping 15 days,  if Payroll 5 days
    //   currDate.setMonth(currDate.getMonth() + 1); // 1 month
    // } else if (isExisting.job.jobName === "Vat Return") {
    //   // Add 3 months
    //   yearEnd.setMonth(yearEnd.getMonth() + 3); // 3 months
    //   jobDeadline.setMonth(jobDeadline.getMonth() + 3); // 37 days
    //   currDate.setMonth(currDate.getMonth() + 3); // 3 months
    // } else {
    //   // Add 12 months
    //   yearEnd.setMonth(yearEnd.getMonth() + 12); // 1 year
    //   jobDeadline.setMonth(jobDeadline.getMonth() + 12); // if (isExisting.job.jobName==="Personal Tax") then add 301 days, if (isExisting.job.jobName==="Accounts") then add 8 months , if (isExisting.job.jobName==="Company Sec") then add 14 days, // 1 year if (isExisting.job.jobName==="Address") then add 1 month before year end
    //   currDate.setMonth(currDate.getMonth() + 12); // 1 year if (isExisting.job.jobName==="Address") then add 1 month before year end
    // }

    // Update the job document with the new dates
    isExisting.job.yearEnd = yearEnd;
    isExisting.job.jobDeadline = jobDeadline;
    isExisting.currentDate = currDate;
    isExisting.totalTime = "0s";

    await isExisting.save();

    return res.status(200).send({
      success: true,
      message: "status completed!",
      jobs: clientJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while complete job!",
      error: error.message,
    });
  }
};

// Update Client_Job Complete Status
export const updateClientStatus = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { status: "process" } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Client Job status updated successfully!",
      clientJob: clientJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job status !",
      error: error,
    });
  }
};

// Function to parse Excel/CSV data
const parseData = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// Controller to handle file upload
export const importData = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const data = parseData(file.buffer);

    const clients = data.map((job) => ({
      clientName: job.clientName || "",
      regNumber: job.regNumber || "",
      companyName: job.companyName || "",
      email: job.email || "",
      totalHours: job.totalHours || "",
      currentDate: job.currentDate ? new Date(job.currentDate) : null,
      source: job.source || "",
      clientType: job.clientType || "",
      country: job.country || "",
      fee: job.fee || "",
      ctLogin: job.ctLogin || "",
      pyeLogin: job.pyeLogin || "",
      trLogin: job.trLogin || "",
      vatLogin: job.vatLogin || "",
      authCode: job.authCode || "",
      utr: job.utr || "",
      job: {
        jobName: job.jobName || "",
        yearEnd: job.yearEnd ? new Date(job.yearEnd) : null,
        jobDeadline: job.jobDeadline ? new Date(job.jobDeadline) : null,
        workDeadline: job.workDeadline ? new Date(job.workDeadline) : null,
        hours: job.jhours || "",
        fee: job.jfee || "",
        jobStatus: job.jobStatus || "",
        lead: job.lead || "",
        jobHolder: job.jobHolder || "",
      },
    }));

    await jobsModel.insertMany(clients);
    res.status(200).send({
      success: true,
      message: "Data imported successfully!",
    });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).send("An error occurred while importing data.");
  }
};

// Adding Label in Jobs
export const addlabel = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { name, color } = req.body;

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const updateJob = await jobsModel.findByIdAndUpdate(
      { _id: job._id },
      { "label.name": name, "label.color": color },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Label added!",
      job: updateJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in add job label!",
      error: error,
    });
  }
};

// Create Subtask
export const createSubTask = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { subTask } = req.body;
    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!subTask) {
      return res.status(400).send({
        success: false,
        message: "Subtask is required!",
      });
    }

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    job.subtasks.push({ subTask: subTask });

    await job.save();

    res.status(200).send({
      success: true,
      message: "Subtask added successfully!",
      job: job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in create subtask!",
      error: error,
    });
  }
};

// Update SubTask Status
export const updateSubTaskStaus = async (req, res) => {
  try {
    const jobId = req.params.id;

    const { subTaskId } = req.body;
    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!subTaskId) {
      return res.status(400).send({
        success: false,
        message: "Subtask id is required!",
      });
    }

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const subtaskIndex = job.subtasks.findIndex(
      (item) => item._id.toString() === subTaskId
    );
    if (subtaskIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Subtask not found!",
      });
    }

    job.subtasks[subtaskIndex].status =
      job.subtasks[subtaskIndex].status === "process" ? "complete" : "process";

    await job.save();

    res.status(200).send({
      success: true,
      message: "Subtask status updated!",
      job: job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update subtask!",
      error: error,
    });
  }
};

// Delete Subtask
export const deleteSubTask = async (req, res) => {
  try {
    const { jobId, subTaskId } = req.params;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!subTaskId) {
      return res.status(400).send({
        success: false,
        message: "Subtask id is required!",
      });
    }

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const subtaskIndex = job.subtasks.findIndex(
      (subtask) => subtask._id.toString() === subTaskId
    );

    // If the subtask is not found
    if (subtaskIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Subtask not found!",
      });
    }

    job.subtasks.splice(subtaskIndex, 1);
    await job.save();

    res.status(200).send({
      success: true,
      message: "Subtask deleted!",
      job: job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in delete subtask!",
      error: error,
    });
  }
};

// Add data Label
export const addDatalabel = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { labelId } = req.body;

    const label = await labelModel.findById(labelId);

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const updateJob = await jobsModel.findByIdAndUpdate(
      { _id: job._id },
      { data: label._id },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Data Label added!",
      job: updateJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in add job label!",
      error: error,
    });
  }
};

// Update Time
export const updateTime = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { totalTime } = req.body;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { totalTime: totalTime },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Time update successfully!",
      clientJob: clientJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update total time!",
      error: error,
    });
  }
};

// Update Bulk Jobs
export const updateBulkJob = async (req, res) => {
  try {
    const {
      rowSelection,
      jobHolder,
      lead,
      yearEnd,
      jobDeadline,
      currentDate,
      jobState,
      label,
      dataLabelId,
      source,
      fee,
      totalHours,
    } = req.body;

    if (
      !rowSelection ||
      !Array.isArray(rowSelection) ||
      rowSelection.length === 0
    ) {
      return res.status(400).send({
        success: false,
        message: "No jobs selected for update.",
      });
    }

    // Handle label update
    let currentLabel = { name: "", color: "" };
    if (label) {
      const islabel = await labelModel.findById({ _id: label });

      currentLabel.name = islabel.name;
      currentLabel.color = islabel.color;
    }

    let updateData = {};
    if (jobHolder) updateData["job.jobHolder"] = jobHolder;
    if (lead) updateData["job.lead"] = lead;
    if (yearEnd) updateData["job.yearEnd"] = yearEnd;
    if (jobDeadline) updateData["job.jobDeadline"] = jobDeadline;
    if (currentDate) updateData.currentDate = currentDate;
    if (jobState) updateData["job.jobStatus"] = jobState;
    if (dataLabelId) updateData.data = dataLabelId;
    if (label) updateData.label = currentLabel;
    if (source) updateData.source = source;
    if (fee) updateData.fee = fee;
    if (totalHours) updateData.totalHours = totalHours;

    const updatedJobs = await jobsModel.updateMany(
      {
        _id: { $in: rowSelection },
      },
      { $set: updateData },
      { multi: true }
    );

    // Check if any jobs were updated
    if (updatedJobs.modifiedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs were updated.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Jobs updated successfully!",
      updatedJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update bulk jobs !",
      error: error,
    });
  }
};

// Workflow Page
export const getWorkflowClients = async (req, res) => {
  try {
    const clients = await jobsModel
      .find({ status: { $ne: "completed" } })
      .select(
        "fee  totalHours job.jobName job.lead job.jobHolder source clientType partner createdAt"
      );

    res.status(200).send({
      success: true,
      message: "All Clients!",
      clients: clients,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while get workflow clients!",
      error: error,
    });
  }
};

// Dashboard Page (data)
export const getDashboardClients = async (req, res) => {
  try {
    const type = req.params.type;
    console.log("type:", type);

    const clients = await jobsModel
      .find({ status: { $ne: type } })
      .select(" job.jobName job.jobHolder createdAt ");

    res.status(200).send({
      success: true,
      message: "All clients",
      clients: clients,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all job!",
      error: error,
    });
  }
};

export const dashboardCompletedClients = async (req, res) => {
  try {
    const clients = await jobsModel
      .find({ status: "completed" })
      .select(" job.jobName job.jobHolder createdAt ");

    res.status(200).send({
      success: true,
      message: "All clients",
      clients: clients,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all job!",
      error: error,
    });
  }
};
