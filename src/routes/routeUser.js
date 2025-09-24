import express from "express";
import {
  handleGetLoggedUser,
  handleGetUserByWalletAddress,
} from "../controllers/controllerUser.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/user", auth, handleGetLoggedUser);
router.get("/user/:walletAddress", handleGetUserByWalletAddress);

export { router };
