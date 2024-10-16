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
      .sort({ createdAt: -1 });

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
