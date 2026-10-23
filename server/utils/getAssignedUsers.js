import automationRuleModel from "../models/automationRuleModel.js";

/**
 * Returns the user(s) that should be assigned according to the rule's strategy.
 *
 * @param {Object} [filter]
 * @param {string} [filter.channel]  - "email" | "whatsapp"
 * @param {string} [filter.name]     - rule name
 * @returns {Promise<import("mongoose").Types.ObjectId[]>}
 */
export async function getAssignedUsers({ channel, name } = {}) {
  const query = { enabled: true };
  if (channel) query.channel = channel;
  if (name) query.name = name;

  // nothing useful to search by
  if (!channel && !name) {
    return [];
  }

  const rule = await automationRuleModel
    .findOne(query)
    .sort({ priority: 1 }); // lowest priority number first

  if (!rule?.actions?.assign?.users?.length) {
    return [];
  }

  const { strategy = "fixed", users, currentIndex = 0 } = rule.actions.assign;

  switch (strategy) {
    case "fixed": {
      // return every configured user – no rotation, no randomness
      return users;
    }

    case "round_robin": {
      const nextIndex = currentIndex % users.length;
      const selected = users[nextIndex];

      // advance the pointer for the next call
      await automationRuleModel.updateOne(
        { _id: rule._id },
        { $set: { "actions.assign.currentIndex": nextIndex + 1 } }
      );

      return [selected];
    }

    case "random": {
      const randomIndex = Math.floor(Math.random() * users.length);
      return [users[randomIndex]];
    }

    default:
      throw new Error(`Unknown assignment strategy: ${strategy}`);
  }
}