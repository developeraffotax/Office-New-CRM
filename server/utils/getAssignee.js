import assignementRuleModel from "../models/assignementRuleModel.js";

export async function getAssignee(type) {
  const rule = await assignementRuleModel.findOne({ type });

  if (!rule || rule.assignedUsers.length === 0) {
    return null;
  }

  switch (rule.strategy) {
    case "fixed":
      return rule.assignedUsers[0];

    case "random":
      return rule.assignedUsers[
        Math.floor(Math.random() * rule.assignedUsers.length)
      ];

    case "round_robin": {
      const index = rule.currentIndex % rule.assignedUsers.length;
      const userId = rule.assignedUsers[index];

      rule.currentIndex = (index + 1) % rule.assignedUsers.length;
      await rule.save();

      return userId;
    }

    default:
      return rule.assignedUsers[0];
  }
}