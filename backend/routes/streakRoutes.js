import express from "express";
import streakController, { workoutUpload } from "../controllers/streakController.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Streak routes are working!" });
});

router.use(checkAuth);

router.get("/streak", streakController.getStreak);
router.post("/streak/log", streakController.logWorkout);
router.post("/streak/log-with-photo", workoutUpload, streakController.logWorkoutWithPhoto);
router.post("/streak/reset", streakController.resetStreak);
router.get("/streak/history", streakController.getWorkoutHistory);
router.get("/streak/stats", streakController.getStreakStats);
router.get("/streak/verify-activity", streakController.verifyActivity);

export default router;