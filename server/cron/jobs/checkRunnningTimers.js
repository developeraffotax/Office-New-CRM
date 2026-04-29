import timerModel from "../../models/timerModel.js";
import { io } from "../../index.js";
import { getOnlineAgents } from "../../utils/onlineStatus.js";

const STOP_REASON = "AffoStaff went offline!";
const STOP_MESSAGE = "Your timer was automatically stopped because AffoStaff went offline!";

export const checkRunningTimers = async () => {
  try {
    // ── 1. Fetch running timers (non-Admin only, minimal fields) ──────────
    const runningTimers = await timerModel.aggregate([
      { $match: { isRunning: true } },

      {
        $lookup: {
          from: "users",
          localField: "clientId",
          foreignField: "_id",
          pipeline: [{ $project: { role: 1, _id: 0 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $lookup: {
          from: "roles",
          localField: "user.role",
          foreignField: "_id",
          pipeline: [
            { $match: { name: { $ne: "Admin" } } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: "role",
        },
      },

      // Drops Admin timers (empty role array) without an extra $match stage
      { $unwind: { path: "$role", preserveNullAndEmptyArrays: false } },

      // Only project what downstream logic actually reads
      {
        $project: {
          _id: 1,
          clientId: 1,
          task: 1,
          clientName: 1,
        },
      },
    ]);

    if (!runningTimers.length) {
      console.log("✅ [CRON] No running timers found. Skipping.");
      return;
    }

    // ── 2. Online-agent lookup ─────────────────────────────────────────────
    const onlineAgents = await getOnlineAgents();
    const onlineAgentsSet = new Set(onlineAgents);

    console.log(`🟢 [CRON] Online agents : ${[...onlineAgentsSet].join(", ") || "none"}`);
    console.log(`⏱  [CRON] Running timers: ${runningTimers.length}`);

    // ── 3. Isolate offline-owner timers ───────────────────────────────────
    const timersToStop = runningTimers.filter(
      (t) => !onlineAgentsSet.has(t.clientId.toString())
    );

    if (!timersToStop.length) {
      console.log("✅ [CRON] All timer owners are online. Nothing to stop.");
      return;
    }

    console.log(`🔴 [CRON] Stopping ${timersToStop.length} timer(s) — AffoStaff offline.`);

    // ── 4. Bulk-stop in one DB round-trip ─────────────────────────────────
    const stopTime = new Date();                          // single Date object, reused below
    const timerIds = timersToStop.map((t) => t._id);

    await timerModel.updateMany(
      { _id: { $in: timerIds }, isRunning: true },       // guard: only truly-running docs
      {
        $set: {
          isRunning: false,
          endTime: stopTime.toISOString(),
          note: STOP_REASON,
          autoStoppedReason: STOP_REASON,
        },
      }
    );

    const stopTimeLocale = stopTime.toLocaleString();
    console.log(`✅ [CRON] Stopped ${timerIds.length} timer(s) at ${stopTimeLocale}`);

    // ── 5. Emit socket events ─────────────────────────────────────────────
    // Per-user notification
    for (const timer of timersToStop) {
      io.to(`user:${timer.clientId}`).emit("timer:autoStopped", {
        reasonToStop : STOP_REASON,
        stopTime     : stopTimeLocale,
        message      : STOP_MESSAGE,
        task         : timer.task       ?? "",
        clientName   : timer.clientName ?? "",
      });
    }

    // Broadcast dashboard refresh
    io.emit("runningTimersUpdate");

  } catch (err) {
    // Single top-level catch — inner try/catch was redundant
    console.error("❌ [CRON] checkRunningTimers error:", err.message);
  }
};