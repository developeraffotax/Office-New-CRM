import jobsModel from "../models/jobsModel.js";

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
      country,
      fee,
      ctLogin,
      pyeLogin,
      trLogin,
      vatLogin,
      authCode,
      utr,
      isActive,
      jobs,
    } = req.body;

    // Check for required fields
    if (!clientName || !companyName || !email || !totalHours || !currentDate) {
      return res.status(400).send({
        success: false,
        message: "Please fill the required fields!",
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
          job: [job],
        });

        // Save the client with the current job
        return await client.save();
      })
    );

    // Find if the client already exists by companyName
    // const existingClient = await jobsModel.findOne({ companyName });

    // if (existingClient) {
    //   // If the client exists, update the existing client's jobs
    //   existingClient.jobs.push(...jobs);

    //   await existingClient.save(); // Save the updated client

    //   return res.status(200).send({
    //     success: true,
    //     message: "Jobs added successfully to the existing client",
    //     jobs: existingClient.jobs,
    //   });
    // } else {
    //   // Create a new client if it doesn't exist
    //   const newClient = await jobsModel.create({
    //     clientName,
    //     regNumber,
    //     companyName,
    //     email,
    //     totalHours,
    //     currentDate,
    //     source,
    //     clientType,
    //     country,
    //     fee,
    //     ctLogin,
    //     pyeLogin,
    //     trLogin,
    //     vatLogin,
    //     authCode,
    //     utr,
    //     isActive,
    //     jobs,
    //   });

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
    const clients = await jobsModel.find({});

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

// const createdJobs = await Promise.all(
//   jobs.map(async (job) => {
//     const client = new jobsModel({
//       clientName,
//       regNumber,
//       companyName,
//       email,
//       totalHours,
//       currentDate,
//       source,
//       clientType,
//       country,
//       fee,
//       ctLogin,
//       pyeLogin,
//       trLogin,
//       vatLogin,
//       authCode,
//       utr,
//       isActive,
//       job: [job],
//     });

//     // Save the client with the current job
//     return await client.save();
//   })
// );

// const createdJobs = [];
// for (let i = 0; i < jobs.length; i++) {
//   const job = jobs[i];

//   const newJob = await jobsModel.create({
//     clientName,
//     regNumber,
//     companyName,
//     email,
//     totalHours,
//     currentDate,
//     source,
//     clientType,
//     country,
//     fee,
//     ctLogin,
//     pyeLogin,
//     trLogin,
//     vatLogin,
//     authCode,
//     utr,
//     isActive,
//     job,
//   });

//   createdJobs.push(newJob);
// }
