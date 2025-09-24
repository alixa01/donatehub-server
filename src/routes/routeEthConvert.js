import express from "express";
import { getEthIdrPrice } from "../controllers/controllerEthConvert.js";

const router = express.Router();

router.get("/price/eth-idr", getEthIdrPrice);

export { router };
