import prisma from "../db/index.js";

const createUser = async (userData, role = "USER") => {
  const user = await prisma.user.create({
    data: {
      username: userData.username,
      walletAddress: userData.walletAddress,
      role: role,
    },
  });
  return user;
};

const findUserByUsername = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user;
};

const findUserByWalletAddress = async (walletAddress) => {
  const user = await prisma.user.findUnique({
    where: {
      walletAddress: walletAddress.toLowerCase(),
    },
  });
  return user;
};

const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};

export {
  createUser,
  findUserByUsername,
  findUserByWalletAddress,
  findUserById,
};
