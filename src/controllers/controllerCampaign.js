import {
  createCampaign,
  getCampaignsByCreator,
  getCampaignById,
  getCampaignByStatus,
  getCampaigns,
  updateStatusCampaign,
  getCampaignByAddress,
} from "../services/serviceCampaign.js";
import { uploadMultipleImages } from "../utils/cloudinaryConfig.js";
import axios from "axios";
import { ethers } from "ethers";
import cron from "node-cron";

const handleCreateCampaign = async (req, res) => {
  try {
    const userId = req.user.id;

    const files = req.files;
    const imageUrls = await uploadMultipleImages(files);

    const campaignData = {
      ...req.body,
      goal: parseFloat(req.body.goal),
      deadline: new Date(req.body.deadline).toISOString(),
      imageUrls: imageUrls,
      status: "PENDING",
      creatorId: userId,
      contractAddress: null,
    };
    const newCampaign = await createCampaign(campaignData);

    res.status(201).json({
      message: "Campaign created successfully",
      campaign: newCampaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).send({
      error: "An unexpected error occurred while creating the campaign.",
    });
  }
};

const handleGetCampaigns = async (req, res) => {
  try {
    const { status } = req.query;
    let campaigns;
    if (status) {
      campaigns = await getCampaignByStatus(status.toUpperCase());
    } else {
      campaigns = await getCampaigns();
    }
    if (!campaigns || campaigns.length === 0) {
      return res.status(404).send("No Campaign Found");
    }
    return res.status(200).json(campaigns);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const handlegetCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status === "ACTIVE") {
      return res.status(200).json(campaign);
    }

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    return res.status(200).json(campaign);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const handlegetCampaignsByCreator = async (req, res) => {
  try {
    const id = req.user.id;
    const campaigns = await getCampaignsByCreator(id);
    return res.status(200).json(campaigns);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const handlegetCampaignByAddress = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const campaign = await getCampaignByAddress(contractAddress);
    return res.status(200).json(campaign);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const handleUpdateStatusCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, contractAddress } = req.body;

    const updatedCampaign = await updateStatusCampaign(
      id,
      status,
      contractAddress
    );

    return res.status(200).json({
      message: "Update successfully",
      campaign: updatedCampaign,
    });
  } catch (error) {
    if (error.message.includes("not authorized")) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

const handleDeployCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const userId = req.user.id;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const priceResponse = await axios.get(
      `${req.protocol}://${req.get("host")}/price/eth-idr`
    );
    const conversionRate = priceResponse.data.ethereum.idr;

    const goalInIdr = campaign.goal;
    const goalInEth = goalInIdr / conversionRate;
    const goalInWei = ethers.parseEther(goalInEth.toFixed(18).toString());

    res.status(200).json({ goalInWei: goalInWei.toString() });
  } catch (error) {
    console.error("Prepare deployment error:", error);
    res.status(500).json({ error: "Failed to prepare for deployment." });
  }
};

export {
  handleCreateCampaign,
  handleGetCampaigns,
  handlegetCampaignById,
  handlegetCampaignsByCreator,
  handleUpdateStatusCampaign,
  handleDeployCampaign,
  handlegetCampaignByAddress,
};
