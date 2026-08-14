import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addUserToTeam,
  removeUserFromTeam,
  setTeamLead,
} from "../controllers/teamController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
// import your auth middleware here, e.g. { isAuth, isAdmin } from "../middlewares/auth.js"
// and apply it to the routes below that should be restricted (create/update/delete/set_lead
// are the ones you'll most likely want locked down to admins/team leads)

const router = express.Router();

router.post("/create",  requiredSignIn, createTeam);
router.get("/get_all", requiredSignIn, getAllTeams);
router.get("/:id", requiredSignIn, getTeamById);
router.put("/update/:id", requiredSignIn, updateTeam);
router.delete("/delete/:id", requiredSignIn, deleteTeam);

router.put("/add_user/:userId", requiredSignIn, addUserToTeam);
router.put("/remove_user/:userId", requiredSignIn, removeUserFromTeam);
router.put("/set_lead/:teamId", requiredSignIn, setTeamLead);

export default router;