import jwt from "jsonwebtoken";
import { findUserById } from "../services/serviceAuth.js";

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = payload;
    next();
  });
};

const admin = async (req, res, next) => {
  const userId = req.user.id;
  const user = await findUserById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, payload) => {
    if (!err) req.user = payload;
    next();
  });
};

export { auth, admin, optionalAuth };
