import express from "express";
import {
  handleCreateCampaign,
  handlegetCampaignsByCreator,
  handlegetCampaignById,
  handleGetCampaigns,
  handleUpdateStatusCampaign,
  handleDeployCampaign,
  handlegetCampaignByAddress,
} from "../controllers/controllerCampaign.js";
import { admin, auth, optionalAuth } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/campaign", auth, upload.array("images", 5), handleCreateCampaign);
router.get("/campaign/:id", optionalAuth, handlegetCampaignById);
router.patch("/campaign/:id", auth, handleUpdateStatusCampaign);
router.get("/campaigns", handleGetCampaigns);
router.get("/campaigns-created", auth, handlegetCampaignsByCreator);
router.get("/campaign-history/:contractAddress", handlegetCampaignByAddress);
router.post("/campaign-deploy/:id", auth, handleDeployCampaign);

export { router };
