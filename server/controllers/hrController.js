import mongoose from "mongoose";
import departmentModel from "../models/departmentModel.js";
import hrModel from "../models/hrModel.js";
import XLSX from "xlsx";

// Create
export const createHrTask = async (req, res) => {
  try {
    const { title, department, category, software, description, hrRole, } = req.body;

    const departmentDetail = await departmentModel.findById(department);
    if (!departmentDetail) {
      return res.status(404).send({
        success: false,
        message: "Department not found!",
      });
    }


    console.log("hrRole", hrRole)

    const task = await hrModel.create({
      title,
      hrRole,
      department,
      category,
      software,
      description,
      users: departmentDetail.users,
    });

    res.status(200).send({
      success: true,
      message: "HR task created successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Update
export const updateHrTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, department, category, software, description, hrRole, } = req.body;

    const existingTask = await hrModel.findById(taskId);

    if (!existingTask) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    const departmentDetail = await departmentModel.findById(department);
    if (!departmentDetail) {
      return res.status(404).send({
        success: false,
        message: "Department not found!",
      });
    }

    const existingUsersMap = new Map(
      existingTask.users.map((userObj) => [
        userObj.user.toString(),
        userObj.status,
      ])
    );

    const updatedUsers = departmentDetail.users.map((userObj) => {
      return {
        user: userObj.user,
        status: existingUsersMap.get(userObj.user.toString()) || "No",
      };
    });

    const task = await hrModel.findByIdAndUpdate(
      { _id: existingTask._id },
      {
        title,
        hrRole,
        department,
        category,
        software,
        description,
        users: updatedUsers,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "HR task updated successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while update hr task!",
      error: error,
    });
  }
};

// Fetch All
export const allHrTask = async (req, res) => {
  try {
    const tasks = await hrModel
      .find({})
      .populate("hrRole")
      .populate({
        path: "users.user",
        select: "name email",
      })
      .populate("department")
      .populate({
        path: "department",
        populate: {
          path: "users.user",
          select: "name email",
        },
      });

    res.status(200).send({
      success: true,
      message: "HR tasks list!",
      tasks: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while get hr tasks!",
      error: error,
    });
  }
};

// Fetch By ID
export const hrTaskDetail = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await hrModel
      .findById(taskId)
      .populate("hrRole")
      .populate({
        path: "users.user",
        select: "name email",
      })
      .populate("department")
      .populate({
        path: "department",
        populate: {
          path: "users.user",
          select: "name email",
        },
      });

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "HR task detail!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while get hr task detail!",
      error: error,
    });
  }
};

// Delete By ID
export const deleteHrTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await hrModel.findById(taskId);

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    await hrModel.findByIdAndDelete({ _id: task._id });

    res.status(200).send({
      success: true,
      message: "HR task deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while delete hr task detail!",
      error: error,
    });
  }
};

// Copy Task
export const copyHrTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await hrModel.findById(taskId);

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    const taskData = { ...task.toObject() };
    delete taskData._id;
    delete taskData.createdAt;
    delete taskData.updatedAt;

    const copyTask = await hrModel.create(taskData);

    res.status(200).send({
      success: true,
      message: "Task copy successfully!",
      copyTask: copyTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while copy hr task!",
      error: error,
    });
  }
};

// Update User Status
export const updateUserStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { statusId, status } = req.body;

    const task = await hrModel.findById(taskId);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Task not found!",
      });
    }

    const userIndex = task.users.findIndex(
      (user) => user._id.toString() === statusId
    );

    if (userIndex === -1) {
      return res.status(404).send({
        success: false,
        message: "User not found in this project!",
      });
    }

    task.users[userIndex].status = status;

    await task.save();

    res.status(200).send({
      success: true,
      message: "User status updated successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while update user status, please try again!",
    });
  }
};



























// Update Bulk HR
export const updateBulkHRs = async (req, res) => {
  try {
    const { rowSelection, updates } = req.body;

    console.log("Updates",updates)
    console.log("rowSelection",rowSelection)
    if ( !rowSelection || !Array.isArray(rowSelection) || rowSelection.length === 0 ) {
      return res.status(400).send({ success: false, message: "No jobs selected for update.", });
    }






    if(updates.department) {
      const departmentDetail = await departmentModel.findById(updates.department);
      if (!departmentDetail) {
        return res.status(404).send({
          success: false,
          message: "Department not found!",
        });
      }
  
  
  
  
  
  
  
  
  
  
      // const existingTask = await hrModel.findById(taskId);
  
      const tasks = await hrModel.find({
        _id: { $in: rowSelection },
      });
  
      if (!tasks) {
        return res.status(404).send({
          success: false,
          message: "Hr task not found!",
        });
      }
  
  
  
  
      for (const task of tasks) {
        const existingUsersMap = new Map(
          task.users.map((userObj) => [
            userObj.user.toString(),
            userObj.status,
          ])
        );
    
        const updatedUsers = departmentDetail.users.map((userObj) => {
          return {
            user: userObj.user,
            status: existingUsersMap.get(userObj.user.toString()) || "No",
          };
        });
    
        const doc = await hrModel.findByIdAndUpdate(
          { _id: task._id },
          {
            users: updatedUsers,
          },
          { new: true }
        );
    
      }
    }





















    // const updates = {
    //   title: "x",
    //   department: "",
    //   category: "",
    //   software: "",
    //   "66cc48db9875942c91de45ac": "Yes",
    //   "66cc48db9875942c91de33vf": "No"
    // };





    
      // Separate top-level updates and user status updates
      const updateData = {};
      const arrayFilters = [];

      // Step 1: Separate field updates vs user ID-based updates
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) return;

        if (mongoose.Types.ObjectId.isValid(key)) {
          // Handle user ID-based status update
          const filterKey = `elem${arrayFilters.length}`;
          updateData[`users.$[${filterKey}].status`] = value;
          arrayFilters.push({
            [`${filterKey}.user`]: new mongoose.Types.ObjectId(key)
          });
        } else {
          // Handle top-level field update
          updateData[key] = value;
        }
      });


          
      // Step 2: Run updateMany
      const updatedRows = await hrModel.updateMany(
        {
          _id: { $in: rowSelection.map(id => new mongoose.Types.ObjectId(id)) }
        },
        {
          $set: updateData
        },
        {
          arrayFilters: arrayFilters
        }
      );



    // Check if any hrs were updated
    if (updatedRows.modifiedCount === 0) {
      return res.status(404).send({ success: false, message: "No rows were updated.", });
    }
    
    res.status(200).send({ success: true, message: "Rows updated successfully!", updatedRows, });

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error in update bulk HRs!", error: error, });
  }
};









































// Function to parse Excel/CSV data
const parseData = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// const parseExcelDate = (serial) => {
//   if (!serial || isNaN(serial)) return null;
//   const excelEpoch = new Date(Date.UTC(1900, 0, 1));
//   const daysOffset = Math.floor(serial - 1);
//   const millisecondsInDay = 24 * 60 * 60 * 1000;
//   return new Date(excelEpoch.getTime() + daysOffset * millisecondsInDay);
// };

// Controller to handle file upload
export const importData = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({message: "No file uploaded."});
    }

    const data = parseData(file.buffer);

    console.log("data:", data);

    const errors = {};
    const keys = ['title', 'department', 'category', 'software']
    const isTitleInArr = data?.some(item => {

      // if(!("title" in item)) {
      //   errors.title = "title column is missing"
      // }

      for (const key of keys) {
        if(!(key in item)) {
          errors[key] = `${key} column is missing!`
        }
      }


      
    });
    
    if(Object.keys(errors).length > 0) {

      return res.status(400).send({message: `These columns are missing : ${(Object.keys(errors).join(", "))}`});
    }

    

   




    const hr_tasks = await Promise.all(data.map(async (el) => {

      const departmentDoc = await departmentModel.findOne({departmentName: el.department });

      console.log(departmentDoc)
      console.log("the element is", departmentDoc)


      if(el && 'title' in el) {
        return {
          title: el.title,
          department: departmentDoc ? departmentDoc._id : null,
          category: el.category || "",
          software: el.software || "",
          description: el.description || "",
          users: departmentDoc ? departmentDoc.users.map(user => ({user: user.user})) : []
          
          
        }
      }
      

    }));

    console.log(hr_tasks)
    const cleanArray = hr_tasks.filter(Boolean);

    console.log("CLEANED ARR:", cleanArray)


    
    await hrModel.insertMany(cleanArray);
    res.status(200).send({
      success: true,
      message: "Data imported successfully!",
    });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).send("An error occurred while importing data.");
  }
};



