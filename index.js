import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

import { router as authRoute } from "./src/routes/routeAuth.js";
import { router as campaignRoute } from "./src/routes/routeCampaign.js";
import { router as userRoute } from "./src/routes/routeUser.js";
import { router as convertRoute } from "./src/routes/routeEthConvert.js";

import "./src/cronJobs.js";

const app = express();
const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(authRoute);
app.use(campaignRoute);
app.use(userRoute);
app.use(convertRoute);

app.listen(3000, () => {
  console.log("Running gan");
});
