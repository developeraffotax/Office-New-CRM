import labelModel from "../models/labelModel.js";
import subscriptionModel from "../models/subscriptionModel.js";
import { isAdmin, isTeamLead } from "../utils/checkPermission.js";
import { getUserAndJuniorIds, getUserAndJuniorNames } from "../utils/getUserAndJuniorIds.js";

// Create Subscription
export const createSubscription = async (req, res) => {
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
      job,
    } = req.body;

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

    const subscription = await subscriptionModel.create({
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
      job,
    });

    res.status(200).send({
      success: true,
      message: "Subscription created successfully!",
      subscription: subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create subscription!",
      error: error,
    });
  }
};

// Update Subscription
export const updateSubscription = async (req, res) => {
  try {
    const subId = req.params.id;
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
      job,
      
    } = req.body;

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

    const existingSub = await subscriptionModel.findById(subId);

    if (!existingSub) {
      return res.status(200).send({
        success: false,
        message: "Subscription not found!",
      });
    }

    const subscription = await subscriptionModel.findByIdAndUpdate(
      { _id: existingSub._id },
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
        job,
        
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Subscription update successfully!",
      subscription: subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update subscription!",
      error: error,
    });
  }
};









export const updateSingleField = async (req, res) => {

  const allowedFields = {
  "job.jobHolder": "jobHolder",
  "job.billingStart": "billingStart",
  "job.billingEnd": "billingEnd",
  "job.deadline": "deadline",
  "job.lead": "lead",
  "job.fee": "fee",
  note: "note",
  status: "status",
  subscription: "subscription",
  source: "source",
  completedAt: "completedAt",
};


  try {
    const subId = req.params.id;
    const body = req.body;

    // Build update object by including only fields present in the request body
    const updateFields = Object.entries(allowedFields).reduce((acc, [key, bodyKey]) => {
      if (body[bodyKey] !== undefined) {
        acc[key] = body[bodyKey];
      }
      return acc;
    }, {});

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updatedSubscription = await subscriptionModel.findByIdAndUpdate(
      subId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedSubscription) {
      return res.status(404).send({
        success: false,
        message: "Subscription not found!",
      });
    }

     res.status(200).send({
      success: true,
      message: "Subscription updated successfully!",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while updating subscription!",
      error: error.message,
    });
  }
};











 

// Get All Subcription
export const fetchAllSubscription = async (req, res) => {

   const { progressStatus="in_progress" } = req.query;

   const isUserAdmin = isAdmin(req);
   const isUserTeamLead = isTeamLead(req);


  //  const userIds = await getUserAndJuniorIds(req.user.user._id);

  const filters = {};


  if(!isUserAdmin) {


    if(isUserTeamLead) {
      const leadAndJuniorsNamesArr = await getUserAndJuniorNames(req.user.user._id);
      filters["job.jobHolder"] = {$in: leadAndJuniorsNamesArr}


    }else  {

      filters["job.jobHolder"] = req.user.user.name
    }
    
    




  }

   
  // console.log("REQ >>>>>>>>>>>>>>>>>>>>", req?.user?.user)

  if (progressStatus) {
    filters.progressStatus = progressStatus;
  }

  try {
    const subscriptions = await subscriptionModel
      .find(filters)
      .sort({ createdAt: -1 })
      .populate("data");

    res.status(200).send({
      success: true,
      message: "Subscription lists",
      subscriptions: subscriptions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all subscriptions list!",
      error: error,
    });
  }
};

// Fetch Single Subcription
export const fetchSingleSubscription = async (req, res) => {
  try {
    const subId = req.params.id;
    const subscription = await subscriptionModel.findById(subId);

    res.status(200).send({
      success: true,
      message: "Single Subscription ",
      subscription: subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single subscription!",
      error: error,
    });
  }
};

// Remove Subcription
export const deleteSubscription = async (req, res) => {
  try {
    const subId = req.params.id;

    const isExisting = await subscriptionModel.findById(subId);

    if (!isExisting) {
      return res.status(400).send({
        success: false,
        message: "Subscription not found!",
      });
    }
    await subscriptionModel.findByIdAndDelete(isExisting._id);

    res.status(200).send({
      success: true,
      message: "Subscription deleted successfully! ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete subscription!",
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

    const job = await subscriptionModel.findById(jobId);

    if (!job) {
      return res.status(400).send({
        success: false,
        message: "Subscription not found!",
      });
    }

    const updateJob = await subscriptionModel.findByIdAndUpdate(
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

// Update Bulk Jobs
export const updateBulkSubscription = async (req, res) => {
  try {
    const {
      rowSelection,
      jobHolder,
      lead,
      billingStart,
      billingEnd,
      deadline,
      jobStatus,
      dataLabelId,
      source,
      fee,
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

    let updateData = {};
    if (jobHolder) updateData["job.jobHolder"] = jobHolder;
    if (lead) updateData["job.lead"] = lead;
    if (billingStart) updateData["job.billingStart"] = billingStart;
    if (billingEnd) updateData["job.billingEnd"] = billingEnd;
    if (deadline) updateData.deadline = deadline;
    if (jobStatus) updateData.status = jobStatus;
    if (dataLabelId) updateData.data = dataLabelId;
    if (source) updateData.source = source;
    if (fee) updateData["job.fee"] = fee;

 
    const updatedJobs = await subscriptionModel.updateMany(
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
        message: "No subscription job were updated.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Subscription jobs update successfully!",
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



















// Mark Subscription as In Progress
export const markSubscriptionInProgress = async (req, res) => {
  try {
    const subId = req.params.id;

    const existingSub = await subscriptionModel.findById(subId);

    if (!existingSub) {
      return res.status(404).send({
        success: false,
        message: "Subscription not found!",
      });
    }

    const subscription = await subscriptionModel.findByIdAndUpdate(
      { _id: existingSub._id },
      { progressStatus: "in_progress", progressedBy: req.user.user._id, progressedAt: new Date() },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Subscription marked as in progress!",
      subscription: subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while marking subscription as in progress!",
      error: error,
    });
  }
};

// Mark Subscription as Completed
export const markSubscriptionCompleted = async (req, res) => {
  try {
    const subId = req.params.id;
    const userId = req.user.user._id;

    const existingSub = await subscriptionModel.findById(subId);

    if (!existingSub) {
      return res.status(404).send({
        success: false,
        message: "Subscription not found!",
      });
    }

    const subscription = await subscriptionModel.findByIdAndUpdate(
      { _id: existingSub._id },
      { progressStatus: "completed", completedBy: userId, completedAt: new Date() },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Subscription marked as completed!",
      subscription: subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while marking subscription as completed!",
      error: error,
    });
  }
};

// Copy Subscription
export const copySubscription = async (req, res) => {
  try {
    const subId = req.params.id;

    const existingSub = await subscriptionModel.findById(subId);

    if (!existingSub) {
      return res.status(404).send({
        success: false,
        message: "Subscription not found!",
      });
    }

    const subData = existingSub.toObject();

    delete subData._id;
    delete subData.createdAt;
    delete subData.updatedAt;
    delete subData.__v;

    if (subData.job) {
      delete subData.job._id;
    }

    const copiedSubscription = await subscriptionModel.create({
      ...subData,
      clientName: `${subData.clientName}`,
      progressStatus: "in_progress",
    });

    res.status(200).send({
      success: true,
      message: "Subscription copied successfully!",
      subscription: copiedSubscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while copying subscription!",
      error: error,
    });
  }
};