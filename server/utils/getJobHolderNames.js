 
import User from "../models/userModel.js";


async function getJobHolderNames(userIds) {
    try {
      const users = await User.find(
        { _id: { $in: userIds } },
        { name: 1 } // Only select name
      ).lean();
  
      return users.map(user => user.name);
    } catch (err) {
      console.error('Error fetching names:', err);
      throw err;
    }
  }
  
export default getJobHolderNames;