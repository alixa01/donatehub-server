import { findUserByWalletAddress } from "../services/serviceAuth.js";

const handleGetLoggedUser = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const user = await findUserByWalletAddress(walletAddress);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const handleGetUserByWalletAddress = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    const user = await findUserByWalletAddress(walletAddress);

    if (!user) {
      return res.status(404).json({ username: null });
    }

    return res.json({ username: user.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { handleGetLoggedUser, handleGetUserByWalletAddress };
