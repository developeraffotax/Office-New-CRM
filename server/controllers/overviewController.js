import jobsModel from "../models/jobsModel.js";
import taskModel from "../models/taskModel.js";
import ticketModel from "../models/ticketModel.js";

 

// Get All Notification
export const getOverview = async (req, res) => {
  try {
    
    
    const {_id, name} = req.user.user;

    if(!name) {
      return res.status(404).send({
        success: false,
        message: "Invalid User!",
      });
    }

      console.log( req.user.user, "the name from overview💚");





    //tasks
    const tasksLength = await taskModel.countDocuments({
      status: { $ne: "completed" },
      jobHolder: name
    });

    const completedTasksLength = await taskModel.countDocuments({
      status: "completed",
      jobHolder: name
    });



    //jobs
    const jobsLength = await jobsModel.countDocuments({
      status: { $eq: "process" },
      "job.jobStatus": { $ne: "Inactive" },
      "job.jobHolder": name,
    });

    const completedJobsLength = await jobsModel.countDocuments({
      status: "completed",
       "job.jobStatus": { $ne: "Inactive" },
      "job.jobHolder": name,
    });



    //tickets
    const ticketsLength = await ticketModel.countDocuments({
      state: { $ne: "complete" },
      jobHolder: name
       
    });

    const completedTicketsLength = await ticketModel.countDocuments({
      state: { $eq: "complete" },
      jobHolder: name
    });


     

     



    res.status(200).send({
      success: true,
      tasks: {tasksLength, completedTasksLength},
      jobs: {jobsLength, completedJobsLength},
      tickets: {ticketsLength, completedTicketsLength}

      
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};

 