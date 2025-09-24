import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByUsername,
  findUserByWalletAddress,
} from "../services/serviceAuth.js";

const handleRegister = async (req, res) => {
  try {
    const userData = req.body;

    const existUserByUsername = await findUserByUsername(userData.username);
    if (existUserByUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existUserByWalletAddress = await findUserByWalletAddress(
      userData.walletAddress
    );
    if (existUserByWalletAddress) {
      return res
        .status(400)
        .json({ error: "Wallet address already registered" });
    }

    const newUser = await createUser(userData);
    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await findUserByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({ error: "Wallet not registered yet" });
    }
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      walletAddress: user.walletAddress,
    };
    const token = jwt.sign(payload, process.env.JWT_TOKEN, {
      expiresIn: "6h",
    });
    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

export { handleRegister, handleLogin };
