import express from "express";
import { handleLogin, handleRegister } from "../controllers/controllerAuth.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);

export { router };
