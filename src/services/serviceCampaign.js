import prisma from "../db/index.js";
import { ethers } from "ethers";
import CampaignContractAbi from "../abi/campaignContract.json" assert { type: "json" };

const createCampaign = async (campaignData) => {
  const { creatorId, ...rest } = campaignData;
  const campaign = await prisma.campaign.create({
    data: {
      ...rest,
      creator: {
        connect: { id: creatorId },
      },
    },
  });
  return campaign;
};

const getCampaigns = async () => {
  const campaigns = await prisma.campaign.findMany({
    include: {},
  });
  return campaigns;
};

const getCampaignByStatus = async (status) => {
  const campaign = await prisma.campaign.findMany({
    where: {
      status: status,
    },
    include: {
      creator: true,
    },
  });
  return campaign;
};

const getCampaignById = async (id) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: id,
    },
    include: {
      creator: true,
    },
  });
  return campaign;
};

const getCampaignsByCreator = async (id) => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      creatorId: id,
    },
  });
  return campaigns;
};

const getCampaignByAddress = async (contractAddress) => {
  const campaign = await prisma.campaign.findFirst({
    where: { contractAddress: contractAddress },
    select: { id: true, title: true },
  });
  return campaign;
};

const updateStatusCampaign = async (id, newStatus, contractAddress) => {
  const data = { status: newStatus };

  if (contractAddress) {
    data.contractAddress = contractAddress;
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data,
  });

  return campaign;
};

const CAMPAIGN_ABI = CampaignContractAbi.abi ?? CampaignContractAbi;

const RPCS = [
  process.env.RPC_URL_BASE ?? "https://mainnet.base.org",
  "https://base-rpc.publicnode.com",
  "https://1rpc.io/base",
];

function makeProvider(idx = 0) {
  const req = new ethers.FetchRequest(RPCS[idx]);
  req.timeout = 15_000;
  req.retryLimit = 2;
  return new ethers.JsonRpcProvider(req, {
    chainId: 8453,
    name: "base",
  });
}

let provider = makeProvider();

async function withFallback(fn) {
  for (let i = 0; i < RPCS.length; i++) {
    try {
      if (i > 0) provider = makeProvider(i);
      return await fn(provider);
    } catch (e) {
      if (i === RPCS.length - 1) throw e;
    }
  }
  throw new Error("No RPC available");
}

async function safeQueryFilter(
  contract,
  filter,
  fromBlock,
  toBlock,
  step = 2000
) {
  const out = [];
  for (let start = fromBlock; start <= toBlock; start += step) {
    const end = Math.min(start + step - 1, toBlock);
    const part = await contract.queryFilter(filter, start, end);
    out.push(...part);
  }
  return out;
}

async function checkAndUpdateCompletedCampaign() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ["ACTIVE", "COMPLETED"] } },
    select: {
      id: true,
      status: true,
      contractAddress: true,
      deployBlockNumber: true,
      lastCheckedBlock: true,
    },
  });

  if (campaigns.length === 0) return 0;

  const currentBlock = await withFallback((p) => p.getBlockNumber());

  const toComplete = new Set();
  const toSuccessful = new Set();
  const needUpdateBlocks = [];

  for (const c of campaigns) {
    if (!c.contractAddress) continue;

    try {
      const contract = new ethers.Contract(
        c.contractAddress,
        CAMPAIGN_ABI,
        provider
      );

      const summary = await withFallback(() => contract.getSummary());
      const owner = summary[0];
      const title = summary[1];
      const goalAmount = BigInt(summary[2]);
      const deadline = BigInt(summary[3]);
      const totalRaised = BigInt(summary[4]);

      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      const isDeadlinePassed = nowSec >= deadline;
      const isGoalReached = totalRaised >= goalAmount;

      if (c.status === "ACTIVE" && (isDeadlinePassed || isGoalReached)) {
        toComplete.add(c.id);
      }

      const hasWithdrawnFilter = contract.filters?.Withdrawn;
      if (typeof hasWithdrawnFilter === "function") {
        const filter = contract.filters.Withdrawn();

        const fromBlock =
          (c.lastCheckedBlock ??
            c.deployBlockNumber ??
            Math.max(0, currentBlock - 100_000)) + 1;
        const toBlock = currentBlock;

        if (toBlock >= fromBlock) {
          const events = await withFallback((p) =>
            safeQueryFilter(
              new ethers.Contract(c.contractAddress, CAMPAIGN_ABI, p),
              filter,
              fromBlock,
              toBlock,
              2000
            )
          );
          if (events.length > 0) toSuccessful.add(c.id);
          needUpdateBlocks.push({ id: c.id, lastCheckedBlock: toBlock });
        }
      }
    } catch (err) {
      console.error(`Failed to check ${c.contractAddress}:`, err);
    }
  }

  for (const id of toSuccessful) toComplete.delete(id);

  let totalUpdated = 0;

  await prisma.$transaction(async (tx) => {
    if (toComplete.size > 0) {
      const res = await tx.campaign.updateMany({
        where: { id: { in: Array.from(toComplete) } },
        data: { status: "COMPLETED" },
      });
      totalUpdated += res.count;
    }
    if (toSuccessful.size > 0) {
      const res = await tx.campaign.updateMany({
        where: { id: { in: Array.from(toSuccessful) } },
        data: { status: "SUCCESSFUL" },
      });
      totalUpdated += res.count;
    }
    for (const u of needUpdateBlocks) {
      await tx.campaign.update({
        where: { id: u.id },
        data: { lastCheckedBlock: u.lastCheckedBlock },
      });
    }
  });

  return totalUpdated;
}

export {
  createCampaign,
  getCampaigns,
  getCampaignByStatus,
  getCampaignById,
  getCampaignsByCreator,
  updateStatusCampaign,
  checkAndUpdateCompletedCampaign,
  getCampaignByAddress,
};
