import express from "express";
import {
  getMessagesByLocation,
  getRecentMessages,
  getLocationStats
} from "../controllers/groupChat.controller.js";

const router = express.Router();

// API Routes for Group Chat
router.get("/:location/recent", getRecentMessages);
router.get("/:location", getMessagesByLocation);
router.get("/:location/stats", getLocationStats);

export default router;
