import activityModel from "../models/activityModel.js";
import jobsModel from "../models/jobsModel.js";
import labelModel from "../models/labelModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import XLSX from "xlsx";
import moment from "moment";
import redisClient from "../utils/redisClient.js";

const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

// Create Job
export const createJob = async (req, res) => {
  try {
    const {
      clientName,
      regNumber,
      companyName,
      email,
      phone,
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
          phone,
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

            jobStatus: job.jobStatus || "",
          },
        });

        // Push activity to activities array
        client.activities.push({
          user: req.user.user._id,
          activity: `${req.user.user.name} has created this job.`,
        });

        // Save the client with the current job
        return await client.save();
      })
    );

    // Add Activity Log
    const user = req.user.user;
    if (createdJobs) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is create a Job: ${companyName}`,
        entity: "Jobs",
        details: `Job Details:
        - Company Name: ${companyName}
        - Job Client: ${clientName || "No client provided"}
        - Created At: ${currentDateTime}`,
      });
    }

    //  await redisClient.del('all_jobs');

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

  const redisKey = 'all_jobs';


  try {

    // const cachedJobs = await redisClient.get(redisKey);
    // if (cachedJobs) {
    //   console.log('✅ Redis cache hit');

    //   const response = {
    //     success: true,
    //     message: "All clients",
    //     clients: JSON.parse(cachedJobs),
    //   }

    //   return res.json(response);
    // }





    const clients = await jobsModel
      .find({
        status: { $ne: "completed" },
        "job.jobStatus": { $ne: "Inactive" },
      })
      .select(
        "clientName companyName regNumber email fee currentDate totalHours totalTime job.jobName job.yearEnd job.jobDeadline job.workDeadline job.jobStatus job.lead job.jobHolder comments._id comments.status label source data activeClient clientType"
      )
      .populate("data");







      

    // await redisClient.setEx(redisKey, 300, JSON.stringify(clients)); // TTL = 60 seconds
    // console.log('🆕 Redis cache set');




    res.status(200).send({
      success: true,
      message: "All clients",
      clients: clients,
    });

    // sendDatatoGoogleSheet();
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








































// Update Client Fee
export const updateFee = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { fee } = req.body;
    if (!fee) {
      return res.status(400).send({
        success: false,
        message: "Fee is required!",
      });
    }

    if (!clientId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }

      console.log("Updating fee for client ID:", clientId);
      console.log("New fee value:", fee);

    // Fetch the job first to get the old fee
    const clientJobBeforeUpdate = await jobsModel.findById(clientId);

    if (!clientJobBeforeUpdate) {
      // Handle case where job is not found
      return res.status(404).json({ message: "Job not found." });
    }

    const oldFee = clientJobBeforeUpdate.fee;

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: clientId },
      { $set: { "fee": fee } },
      { new: true }
    );

    // Push activity to activities array
    clientJob.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated job fee from "${oldFee ? oldFee : "empty"}" to "${fee}".`,
    });

    await clientJob.save();

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Job Fee updated successfully!",
      clientJob: clientJob,
    });

    // Add Activity Log
    const user = req.user.user;
    if (clientJob) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is update a job fee.`,
        entity: "Jobs",
        details: `Job Details:
          - Company Name: ${clientJob.companyName}
          - Job Client: ${clientJob.clientName || "No client provided"}
          - Created At: ${currentDateTime}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job fee !",
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


     // Fetch the job first to get the old fee
    const clientJobBeforeUpdate = await jobsModel.findById(jobId);

    if (!clientJobBeforeUpdate) {
      // Handle case where job is not found
      return res.status(404).json({ message: "Job not found." });
    }

    const oldStatus = clientJobBeforeUpdate.job.jobStatus;



    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { "job.jobStatus": status } },
      { new: true }
    );

    // Push activity to activities array
    clientJob.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated job status from "${oldStatus ? oldStatus : "empty"}" to "${status}".`,
    });

    await clientJob.save();

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Job status updated successfully!",
      clientJob: clientJob,
    });

    // Add Activity Log
    const user = req.user.user;
    if (clientJob) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is update a job status.`,
        entity: "Jobs",
        details: `Job Details:
          - Company Name: ${clientJob.companyName}
          - Job Client: ${clientJob.clientName || "No client provided"}
          - Created At: ${currentDateTime}`,
      });
    }
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
export const updateActiveClient = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { activeClient } = req.body;
    if (!activeClient) {
      return res.status(400).send({ success: false, message: "activeClient value is required!", });
    }

    if (!jobId) {
      return res.status(400).send({ success: false, message: "Job id is required!", });
    }

  
    
    const clientJob = await jobsModel.findByIdAndUpdate(
      jobId,
      {
        $set: { activeClient: activeClient },
        $push: {
          activities: {
            user: req.user.user._id,
            activity: `${req.user.user.name} has updated activeClient from "${activeClient === "active" ? "inactive" : "active"}" to "${activeClient}".`,
          },
        },
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Active Client in Job updated successfully!",
      clientJob: clientJob,
    });

    // Add Activity Log
    const user = req.user.user;
    if (clientJob) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} has updated the job client from "${activeClient === "active" ? "inactive" : "active"}" to "${activeClient}"..`,
        entity: "Jobs",
        details: `Job Details:
          - Company Name: ${clientJob.companyName}
          - Job Client: ${clientJob.clientName || "No client provided"}
          - Created At: ${currentDateTime}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job lead !",
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

    // Fetch the job first to get the old fee
    const clientJobBeforeUpdate = await jobsModel.findById(jobId);

    if (!clientJobBeforeUpdate) {
      // Handle case where job is not found
      return res.status(404).json({ message: "Job not found." });
    }

    const oldLead = clientJobBeforeUpdate.job.lead;

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { "job.lead": lead } },
      { new: true }
    );

    // Push activity to activities array
    clientJob.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has updated job owner from "${oldLead ? oldLead : "empty"}" to "${lead}"  .`,
    });

    await clientJob.save();
    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Lead user updated successfully!",
      clientJob: clientJob,
    });

    // Add Activity Log
    const user = req.user.user;
    if (clientJob) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is update a Job Lead.`,
        entity: "Jobs",
        details: `Job Details:
          - Company Name: ${clientJob.companyName}
          - Job Client: ${clientJob.clientName || "No client provided"}
          - Created At: ${currentDateTime}`,
      });
    }
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

    // Fetch the job first to get the old fee
    const clientJobBeforeUpdate = await jobsModel.findById(jobId);

    if (!clientJobBeforeUpdate) {
      // Handle case where job is not found
      return res.status(404).json({ message: "Job not found." });
    }

    const oldJobHolder = clientJobBeforeUpdate.job.jobHolder;

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { "job.jobHolder": jobHolder } },
      { new: true }
    );

    // Push activity to activities array
    clientJob.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has updated job assign from "${oldJobHolder ? oldJobHolder : "empty"}" to "${jobHolder}".`,
    });

    await clientJob.save();
    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Job holder updated successfully!",
      clientJob: clientJob,
    });

    // Create Notification
    const user = await userModel.findOne({ name: jobHolder });
    if(user && req.user?.user?.name !== jobHolder) {
      await notificationModel.create({
      title: "New Job Assigned",
      redirectLink: "/job-planning",
      description: `${req.user.user.name} assign a new job of "${clientJob.job.jobName}"`,
      taskId: `${clientJob._id}`,
      userId: user._id,
    });
    }

    // Add Activity Log
    if (clientJob) {
      const currectUser = req.user.user;
      activityModel.create({
        user: currectUser._id,
        action: `${currectUser.name.trim()} is update a Job Assign.`,
        entity: "Jobs",
        details: `Job Details:
             - Company Name: ${clientJob.companyName}
             - Job Client: ${clientJob.clientName || "No client provided"}
             - Created At: ${currentDateTime}`,
      });
    }
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

    // Add Activity Log
    const currectUser = req.user.user;
    if (isExisting) {
      activityModel.create({
        user: currectUser._id,
        action: `${currectUser.name.trim()} delete a job.`,
        entity: "Jobs",
        details: `Job Details:
              - Company Name: ${isExisting.companyName || "No company provided"}
              - Job Client: ${isExisting.clientName || "No client provided"}
              - Created At: ${currentDateTime}`,
      });
    }

    await jobsModel.findByIdAndDelete({
      _id: isExisting._id,
    });
    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Job delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete job!",
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

    const clientJob = await jobsModel
      .findById({ _id: jobId })
      .populate({ path: "activities.user", select: "name avatar" })
      .populate({ path: "quality_Check.user", select: "name" });

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
      phone,
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

    console.log("JOBS ARE HTESE>>>>", jobs);

    for (const jobData of jobs) {
      if (jobData.clientId) {
        await jobsModel.findByIdAndUpdate(
          jobData.clientId,
          {
            clientName,
            regNumber,
            companyName,
            email,
            phone,
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
          phone,
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


    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Client job(s) updated successfully!",
    });

    // Add Activity Log
    const currectUser = req.user.user;

    activityModel.create({
      user: currectUser._id,
      action: `${currectUser.name.trim()} update a job.`,
      entity: "Jobs",
      details: `Job Details:
              - Company Name: ${companyName || "No company provided"}
              - Job Client: ${clientName || "No client provided"}
              - Created At: ${currentDateTime}`,
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
    const { yearEnd, jobDeadline, workDeadline, currentDate } = req.body;

    const formatDate = (date) => {
      const options = { day: "2-digit", month: "short", year: "numeric" };
      return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
    };

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }


      // Fetch the job first to get the old fee
    const clientJobBeforeUpdate = await jobsModel.findById(jobId);

    if (!clientJobBeforeUpdate) {
      // Handle case where job is not found
      return res.status(404).json({ message: "Job not found." });
    }

    const {yearEnd: oldYearEnd, jobDeadline: oldJobDeadline, workDeadline: oldWorkDeadline, } = clientJobBeforeUpdate.job;
    const oldCurrentDate = clientJobBeforeUpdate.currentDate;



    let clientJob;

    if (yearEnd) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { "job.yearEnd": yearEnd } },
        { new: true }
      );

      // Push activity to activities array
      clientJob.activities.push({
        user: req.user.user._id,
        activity: `${
          req.user.user.name
        } has updated Year-End from "${formatDate(oldYearEnd)}" to "${formatDate(yearEnd)}" .`,
      });
    }
    if (jobDeadline) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { "job.jobDeadline": jobDeadline } },
        { new: true }
      );

      // Push activity to activities array
      clientJob.activities.push({
        user: req.user.user._id,
        activity: `${
          req.user.user.name
        } has updated Job-Deadline from "${formatDate(oldJobDeadline)}" to "${formatDate(jobDeadline)}".`,
      });
    }
    if (workDeadline) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { "job.workDeadline": workDeadline } },
        { new: true }
      );

      // Push activity to activities array
      clientJob.activities.push({
        user: req.user.user._id,
        activity: `${
          req.user.user.name
        } has updated Job-Date from "${formatDate(oldWorkDeadline)}" to "${formatDate(workDeadline)}".`,
      });
    }

    if (currentDate) {
      clientJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { currentDate: currentDate } },
        { new: true }
      );

      // Push activity to activities array
      clientJob.activities.push({
        user: req.user.user._id,
        activity: `${
          req.user.user.name
        } has updated Signup-Date from "${formatDate(oldCurrentDate)}" to "${formatDate(currentDate)}".`,
      });
    }

    await clientJob.save();

    const populatedClientJob = await jobsModel.findById(jobId).populate("data");


    // console.log("Populated Client Job:", populatedClientJob);
    // console.log("Non populated Client Job:", clientJob);

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Date updated successfully!",
      clientJob: populatedClientJob,
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

// Get Only Status (Inactive) Jobs
export const getInactiveClientJobs = async (req, res) => {
  try {
    const clients = await jobsModel.find({ "job.jobStatus": "Inactive" });

    res.status(200).send({
      success: true,
      message: "All client jobs whose status is Inactive!",
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
    let workDeadline = new Date(isExisting.job.workDeadline);

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
      workDeadline.setMonth(workDeadline.getMonth() + 1); // Add 1 month
    } else if (isExisting.job.jobName === "Vat Return") {
      // Add 3 months
      yearEnd.setMonth(yearEnd.getMonth() + 3);
      jobDeadline.setDate(jobDeadline.getDate() + 37); // Add 37 days
      workDeadline.setMonth(workDeadline.getMonth() + 3); // Add 3 months
    } else {
      // Add 12 months (1 year)
      yearEnd.setMonth(yearEnd.getMonth() + 12);

      // Specific adjustments for different job names
      if (isExisting.job.jobName.trim() === "Personal Tax") {
        jobDeadline.setDate(jobDeadline.getDate() + 301); // Add 301 days
      } else if (isExisting.job.jobName.trim() === "Accounts") {
        jobDeadline.setMonth(jobDeadline.getMonth() + 12); // Add 12 months
      } else if (isExisting.job.jobName.trim() === "Company Sec") {
        jobDeadline.setMonth(jobDeadline.getMonth() + 12); // Add 1 year (12 months)
      } else if (isExisting.job.jobName.trim() === "Address") {
        // Subtract 1 month from yearEnd for jobDeadline and workDeadline
        jobDeadline.setMonth(yearEnd.getMonth() - 1);
        workDeadline.setMonth(yearEnd.getMonth() - 1);
      } else {
        // Default case for other job names: add 12 months to jobDeadline and workDeadline
        jobDeadline.setMonth(jobDeadline.getMonth() + 12);
        workDeadline.setMonth(workDeadline.getMonth() + 12);
      }
    }

    // Update the job document with the new dates
    isExisting.job.yearEnd = yearEnd;
    isExisting.job.jobDeadline = jobDeadline;
    isExisting.job.workDeadline = workDeadline;
    isExisting.totalTime = "0s";

    // console.log("Y,", yearEnd, "J,", jobDeadline, "W,", workDeadline);

    await isExisting.save();

    // Add Activity Log
    const currectUser = req.user.user;
    if (clientJob) {
      activityModel.create({
        user: currectUser._id,
        action: `${currectUser.name.trim()} complete a job.`,
        entity: "Jobs",
        details: `Job Details:
                 - Company Name: ${
                   clientJob.companyName || "No company provided"
                 }
                 - Job Client: ${clientJob.clientName || "No client provided"}
                 - Created At: ${currentDateTime}`,
      });
    }

    // await redisClient.del('all_jobs');
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

    // Push activity to activities array
    clientJob.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has update this job status completed to "progress".`,
    });

    await clientJob.save();

    // await redisClient.del('all_jobs');
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

    // await redisClient.del('all_jobs');
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

     // Fetch the job first to get the old fee
    const clientJobBeforeUpdate = await jobsModel.findById(jobId);

    if (!clientJobBeforeUpdate) {
      // Handle case where job is not found
      return res.status(404).json({ message: "Job not found." });
    }

    const oldLabelName = clientJobBeforeUpdate?.label?.name || "";


    const updateJob = await jobsModel.findByIdAndUpdate(
      { _id: job._id },
      { "label.name": name, "label.color": color },
      { new: true }
    );

    // Push activity to activities array
    updateJob.activities.push({
      user: req.user.user._id,
      activity: !oldLabelName ? `${req.user.user.name} added label "${name}" in this job.` : `${req.user.user.name} updated label from "${oldLabelName}" to "${name}".`,
    });

    await updateJob.save();

    const populatedJob = await jobsModel .findById(jobId).populate("data");

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Label added!",
      job: populatedJob,
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
    
    // .populate({ path: "activities.user", select: "name avatar" })
    //   .populate({ path: "quality_Check.user", select: "name" });;

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    job.subtasks.push({ subTask: subTask });

    // Push activity to activities array
    job.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} added subtask "${subTask}" in job.`,
    });

    await job.save();

    // await redisClient.del('all_jobs');
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

      // Push activity to activities array
    job.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated the subtask "${job.subtasks[subtaskIndex].subTask}" status from "${job.subtasks[subtaskIndex].status === "process" ? "complete" : "process"}" to "${job.subtasks[subtaskIndex].status}".`,
    });




    await job.save();


    // await redisClient.del('all_jobs');
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

     const toBeDeletedSubtask = job.subtasks[subtaskIndex].subTask;

    job.subtasks.splice(subtaskIndex, 1);

    // Push activity to activities array
    job.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has deleted subtask in this job. Deleted subtask: ${toBeDeletedSubtask}`,
    });

    await job.save();

    // await redisClient.del('all_jobs');
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

    const job = await jobsModel.findById(jobId).populate("data");

    console.log("Job:", job.data);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const oldLabelName = job.data ? job.data.name : "";

    const updateJob = await jobsModel.findByIdAndUpdate(
      { _id: job._id },
      { data: label._id },
      { new: true }
    );

    // Push activity to activities array
    updateJob.activities.push({
      user: req.user.user._id,
      activity: oldLabelName ? `${req.user.user.name} has updated CC Person from "${oldLabelName}" to "${label?.name}".` : `${req.user.user.name} has update CC Person & add "${label?.name}" in this job.`,
    });

    await updateJob.save();

    // await redisClient.del('all_jobs');
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

    // await redisClient.del('all_jobs');
    await res.status(200).send({
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
      activeClient,
      qualities,
      clientType,
    } = req.body;

    console.log("qualities:", qualities);

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
    if (clientType) updateData.clientType = clientType;
    if (fee) updateData.fee = fee;
    if (totalHours) updateData.totalHours = totalHours;
    if (activeClient) updateData.activeClient = activeClient;

    const updatedJobs = await jobsModel.updateMany(
      {
        _id: { $in: rowSelection },
      },
      { $set: updateData },
      { multi: true }
    );

    // Add qualities to quality_Check
    if (qualities && Array.isArray(qualities)) {
      for (const quality of qualities) {
        const job = await jobsModel.findOne({ _id: { $in: rowSelection } });
        const currentOrder = job ? job.quality_Check.length : 0;

        await jobsModel.updateMany(
          { _id: { $in: rowSelection } },
          {
            $push: {
              quality_Check: {
                subTask: quality,
                status: "process",
                order: currentOrder,
              },
            },
          }
        );
      }
    }

    // Check if any jobs were updated
    if (updatedJobs.modifiedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs were updated.",
      });
    }

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Jobs updated successfully!",
      updatedJobs,
    });

    // Add Activity Log
    const currectUser = req.user.user;
    if (updatedJobs) {
      activityModel.create({
        user: currectUser._id,
        action: `${currectUser.name.trim()} update bulk jobs.`,
        entity: "Jobs",
        details: `Job Details:
                   - Created At: ${currentDateTime}`,
      });
    }
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
      .find({
        status: { $ne: "completed" },
        "job.jobStatus": { $ne: "Inactive" },
      })
      .select(
        "clientName companyName regNumber fee totalTime totalHours job.yearEnd job.jobDeadline job.workDeadline job.jobName job.lead job.jobStatus job.lead job.jobHolder job.jobHolder source clientType partner activeClient createdAt currentDate label source data activeClient"
      )
      .populate("data");

    const uniqueClients = await jobsModel.aggregate([
      {
        $match: { status: { $ne: "completed" } },
      },
      {
        $group: {
          _id: "$companyName",
          clientName: { $first: "$clientName" },
          id: { $first: "$_id" },
          fee: { $first: "$fee" },
          totalHours: { $first: "$totalHours" },
          jobName: { $first: "$job.jobName" },
          lead: { $first: "$job.lead" },
          jobHolder: { $first: "$job.jobHolder" },
          source: { $first: "$source" },
          clientType: { $first: "$clientType" },
          partner: { $first: "$partner" },
          createdAt: { $first: "$createdAt" },
          currentDate: { $first: "$currentDate" },
          activeClient: { $first: "$activeClient" },
        },
      },
      {
        $project: {
          _id: 0,
          companyName: "$_id",
          clientName: 1,
          id: 1,
          fee: 1,
          totalHours: 1,
          jobName: 1,
          lead: 1,
          jobHolder: 1,
          source: 1,
          clientType: 1,
          partner: 1,
          createdAt: 1,
          currentDate: 1,
          activeClient: 1,
        },
      },
    ]);

    const inactiveClientsCount = await jobsModel.countDocuments({
      "job.jobStatus": "Inactive",
    });

     
    res.status(200).send({
      success: true,
      message: "All Clients!",
      clients: clients,
      uniqueClients: uniqueClients,
      inactiveClientsCount: inactiveClientsCount,
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
      .select(" job.jobName job.jobHolder job.lead createdAt ");

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

// Update Work Plan
export const updateWorkPlan = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { workPlan } = req.body;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job id is required!",
      });
    }
    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { workPlan: workPlan },
      { new: true }
    );

    // Push activity to activities array
    clientJob.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has update work plan in this job.`,
    });

    await clientJob.save();

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Work Plan update successfully!",
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

// Update (Prepared/Review/Filed)
export const updateUsers = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { prepared, review, filed } = req.body;

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found!",
      });
    }

    const clientJob = await jobsModel.findByIdAndUpdate(
      { _id: job._id },
      {
        $set: {
          prepared: prepared || job.prepared,
          review: review || job.review,
          filed: filed || job.filed,
        },
      },
      { new: true }
    );

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Job holder updated successfully!",
      clientJob: clientJob,
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

// Create Quality Control
export const createQuality = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { quality } = req.body;
    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!quality) {
      return res.status(400).send({
        success: false,
        message: "Quality subtask is required!",
      });
    }

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    // Count existing subtasks
    const qualityCheckCount = job.quality_Check ? job.quality_Check.length : 0;

    job.quality_Check.push({ subTask: quality, order: qualityCheckCount + 1 });

    await job.save();

    // job.quality_Check.push({ subTask: quality });

    // Push activity to activities array
    job.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} added quality check "${quality}" in job.`,
    });

    await job.save();


    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Quality check added successfully!",
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

// Update Quality Control
export const updateQuality = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.user._id;

    const { qualityId } = req.body;
    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!qualityId) {
      return res.status(400).send({
        success: false,
        message: "Quality check id is required!",
      });
    }

    const job = await jobsModel
      .findById(jobId)
      .populate({ path: "quality_Check.user", select: "name" });

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const qualityIndex = job.quality_Check.findIndex(
      (item) => item._id.toString() === qualityId
    );
    if (qualityIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Quality check not found!",
      });
    }

    job.quality_Check[qualityIndex].status =
      job.quality_Check[qualityIndex].status === "process"
        ? "complete"
        : "process";
    job.quality_Check[qualityIndex].user = userId;

    
    // Push activity to activities array
    job.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated the quality check status from "${job.quality_Check[qualityIndex].status === "process" ? "complete" : "process"}" to "${job.quality_Check[qualityIndex].status}".`,
    });
    
    await job.save();

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Quality check status updated!",
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

// Delete Quality Control
export const deleteQuality = async (req, res) => {
  try {
    const { jobId, qualityId } = req.params;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!qualityId) {
      return res.status(400).send({
        success: false,
        message: "Quality check id is required!",
      });
    }

    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Job not found!",
      });
    }

    const qualityIndex = job.quality_Check.findIndex(
      (quality) => quality._id.toString() === qualityId
    );

    // If the subtask is not found
    if (qualityIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Quality check not found!",
      });
    }

    const toBeDeletedQuality = job.quality_Check[qualityIndex].subTask;

    job.quality_Check.splice(qualityIndex, 1);

    // Push activity to activities array
    job.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has deleted quality check in this job. Deleted quality check: ${toBeDeletedQuality}`,
    });

    await job.save();


    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Quality check deleted!",
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

// Reordering Subtasks
export const reordering = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { qualities } = req.body;

    // Validate input
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job Id is required!",
      });
    }
    if (!qualities || !Array.isArray(qualities)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quality check format. Must be an array of tasks!",
      });
    }

    // Fetch the task to ensure it exists
    const job = await jobsModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found!",
      });
    }

    // Update the order of each subtask
    await Promise.all(
      qualities.map((stask, index) =>
        jobsModel.updateOne(
          { "quality_Check._id": stask._id },
          { $set: { "quality_Check.$.order": index + 1 } }
        )
      )
    );

    // await redisClient.del('all_jobs');
    res.status(200).json({
      success: true,
      message: "Quality check order updated successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while reordering quality check!",
      error: error.message,
    });
  }
};

// Add Quility Check to All Jobs
export const createQualityForAllJobs = async (req, res) => {
  try {
    const { quality } = req.body;

    if (!quality) {
      return res.status(400).send({
        success: false,
        message: "Quality subtask is required!",
      });
    }

    // Find all jobs with status "Progress"
    const jobs = await jobsModel.find({ jobStatus: "Progress" });

    if (!jobs || jobs.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs found with status 'Progress'!",
      });
    }

    // Iterate through all jobs and add the quality check
    const updatePromises = jobsModel.map(async (job) => {
      const qualityCheckCount = job.quality_Check
        ? job.quality_Check.length
        : 0;

      // Add new quality check subtask
      job.quality_Check.push({
        subTask: quality,
        order: qualityCheckCount + 1,
      });

      // Save the updated job
      return job.save();
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // await redisClient.del('all_jobs');
    res.status(200).send({
      success: true,
      message: "Quality check added to all jobs in progress!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error adding quality check to jobs!",
      error: error.message,
    });
  }
};
















export const addJobActivity = async (req, res) => {

  const jobId = req.params.jobId;
  const activityText = req.body.activityText || "moved this job to Leads!"

  try {

      const clientJob = await jobsModel.findOne( { _id: jobId }, );
       
      // Push activity to activities array
      clientJob.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} ${activityText}`,
      });

      await clientJob.save();

        res.status(200).send({
          success: true,
          message: "Job Actitivites Added successfully!",
          clientJob: clientJob,
        });




  } catch (error) {
    

res.status(500).send({
  success: false,
  message: "Error adding quality check to jobs!",
  error: error.message,
});
  }




}


















