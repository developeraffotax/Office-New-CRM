import assignmentRuleModel from "../models/assignmentRuleModel.js";

 
 
export async function getAssignedUsers(type) {
  const rule = await assignmentRuleModel.findOne({ type });

  if (!rule || !rule.assignedUsers?.length) {
    return [];
  }

  switch (rule?.strategy) {
    case "fixed": {
      // return everyone configured — no rotation, no randomness
      return rule.assignedUsers;
    }

    // case "all_users": {
    //   return rule.assignedUsers;
    // }

    // case "random": {
    //   const users = rule.assignedUsers;
    //   const randomIndex = Math.floor(Math.random() * users.length);
    //   return [users[randomIndex]];
    // }

    default:
      throw new Error(`Unknown assignment strategy: ${strategy}`);
  }
}