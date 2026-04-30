import { connection as redis } from "./ioredis.js";

/**
 * ============================================
 * Get Online Agents from Redis
 * ============================================
 * Reads the "onlineAgents" Redis set.
 *
 * @returns {Promise<string[]>} Array of agent IDs
 */
export const getOnlineAgents = async () => {
  
  try {
    if (!redis || redis.status !== "ready") {
      console.warn("⚠ Redis not ready while fetching online agents");
      return [];
    }

    const agents = await redis.smembers("onlineAgents");

    return agents || [];
  } catch (error) {
    console.error("❌ getOnlineAgents error:", error.message);
    return [];
  }
};





export const getOnlineAgentViaHeartbeat = async (agentId) => {
  try {
    if (!redis || redis.status !== "ready") {
      console.warn("⚠ Redis not ready while checking heartbeat");
      return false;
    }

    const heartbeat = await redis.get(`heartbeat:${agentId.toString()}`);

    return !!heartbeat; // null → false, JSON string → true
  } catch (error) {
    console.error("❌ getOnlineAgentViaHeartbeat error:", error.message);
    return false;
  }
};


/**
 * ============================================
 * Get Online Users (optional helper)
 * ============================================
 */
export const getOnlineUsers = async () => {
  try {
    if (!redis || redis.status !== "ready") {
      console.warn("⚠ Redis not ready while fetching online users");
      return [];
    }

    const users = await redis.smembers("onlineUsers");

    return users || [];
  } catch (error) {
    console.error("❌ getOnlineUsers error:", error.message);
    return [];
  }
};













/**
 * Check if agent is online
 */
export const isAgentOnline = async (agentId) => {
  try {
    if (!redis || redis.status !== "ready") return false;

    return await redis.sismember(
      "onlineAgents",
      agentId.toString()
    );
  } catch (error) {
    console.error("❌ isAgentOnline error:", error.message);
    return false;
  }
};