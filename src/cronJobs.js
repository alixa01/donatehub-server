import cron from "node-cron";
import { checkAndUpdateCompletedCampaign } from "./services/serviceCampaign.js";

cron.schedule("*/15 * * * *", async () => {
  console.log("Checking campaign...");
  try {
    const updatedCount = await checkAndUpdateCompletedCampaign();
    console.log(
      updatedCount > 0
        ? `CRON JOB: Success to update ${updatedCount} campaign.`
        : "CRON JOB: No campaign to update"
    );
  } catch (error) {
    console.error("CRON JOB: Error:", error);
  }
});
