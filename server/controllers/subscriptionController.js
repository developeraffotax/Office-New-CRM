import labelModel from "../models/labelModel.js";
import subscriptionModel from "../models/subscriptionModel.js";

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

// Update Single field
export const updateSingleField = async (req, res) => {
  try {
    const subId = req.params.id;
    const {
      jobHolder,
      billingStart,
      billingEnd,
      deadline,
      lead,
      fee,
      note,
      status,
      subscription,
    } = req.body;

    const existingSub = await subscriptionModel.findById(subId);

    if (!existingSub) {
      return res.status(200).send({
        success: false,
        message: "Subscription not found!",
      });
    }

    const subscriptionData = await subscriptionModel.findByIdAndUpdate(
      { _id: existingSub._id },
      {
        "job.jobHolder": jobHolder || existingSub.job.jobHolder,
        "job.billingStart": billingStart || existingSub.job.billingStart,
        "job.billingEnd": billingEnd || existingSub.job.billingEnd,
        "job.deadline": deadline || existingSub.job.deadline,
        "job.lead": lead || existingSub.job.lead,
        "job.fee": fee || existingSub.job.fee,
        note: note || existingSub.note,
        status: status || existingSub.status,
        subscription: subscription || existingSub.subscription,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Subscription update successfully!",
      subscription: subscriptionData,
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

// Get All Subcription
export const fetchAllSubscription = async (req, res) => {
  try {
    const subscriptions = await subscriptionModel
      .find({})
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

    console.log(
      "Data:",
      jobHolder,
      lead,
      billingStart,
      billingEnd,
      deadline,
      jobStatus,
      dataLabelId,
      source,
      fee
    );

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

    console.log(updateData);

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
