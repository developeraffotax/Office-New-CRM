
import hrRoleModel from "../models/hrRoleModel.js";

// Create Role in HR
export const createHrRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    if (!roleName) {
      return res.status(400).json({ message: "Role name is required" });
    }
    
    
    const hrRole = await hrRoleModel.create({
      roleName,
     
    });

    res.status(200).send({
      success: true,
      message: "Department created successfully!",
      hrRole: hrRole,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while create department, please try again!",
    });
  }
};

// Udpate Role in HR
export const updateHrRole = async (req, res) => {
  try {
    const hrRoleId = req.params.id;
    const { roleName } = req.body;

    const hrRole = await hrRoleModel.findById(hrRoleId);
    if (!hrRole) {
      return res.status(404).send({
        success: false,
        message: "hrRole not found!",
      });
    }

   
    const updatedHrRole = await hrRoleModel.findByIdAndUpdate(
      { _id: hrRole._id },
      {
        roleName: roleName,
       
      },
      { new: true }
    );


    res.status(200).send({
      success: true,
      message: "Department updated successfully!",
      hrRole: updatedHrRole,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while updated department, please try again!",
    });
  }
};





// Fetch All hrRoles
export const fetchHrRoles = async (req, res) => {
  try {
    const hrRoles = await hrRoleModel.find({});

    res.status(200).send({
      success: true,
      message: "hrRole list!",
      hrRoles: hrRoles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while fetch all hrRoles, please try again!",
    });
  }
};







// Delete hrRole
export const deleteHrRole = async (req, res) => {
  try {
    const hrRoleId = req.params.id;

    const hrRole = await hrRoleModel.findById(hrRoleId);
    if (!hrRole) {
      return res.status(404).send({
        success: false,
        message: "hrRole not found!",
      });
    }

    await hrRoleModel.findByIdAndDelete(hrRole._id);

    res.status(200).send({
      success: true,
      message: "Department deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while delete department, please try again!",
    });
  }
};

