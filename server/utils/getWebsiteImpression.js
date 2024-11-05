import { google } from "googleapis";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

// Step 2: Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Step 3: Define the path to credentials file
const CREDENTIALS_PATH = path.join(
  __dirname,
  "..",
  "config",
  "impression.json"
);

// Step 4: Load the service account credentials JSON asynchronously
const credentials = JSON.parse(await readFile(CREDENTIALS_PATH, "utf-8"));

// Step 5: Authenticate with the service account
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

// Step 6: Initialize the Google Search Console client
const searchConsole = google.webmasters({
  version: "v3",
  auth,
});

// Step 7: Define function to fetch clicks and impressions data
export const getSearchConsoleData = async ({ startDate, endDate, siteUrl }) => {
  console.log("Data:", startDate, endDate, siteUrl);
  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["date"],
        rowLimit: 10000,
      },
    });

    // Step 8: Initialize counters for total clicks and impressions
    let totalClicks = 0;
    let totalImpressions = 0;

    // Step 8: Iterate through rows to sum clicks and impressions
    response.data.rows.forEach((row) => {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;
    });

    // Step 8: Return the result as an object
    return { totalClicks, totalImpressions };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Usage example
// const siteUrl = "https://affotax.com/";
// const data = await getSearchConsoleData({
//   startDate: "2024-09-01",
//   endDate: "2024-09-29",
//   siteUrl,
// });

// console.log("Total Clicks:", data.totalClicks);
// console.log("Total Impressions:", data.totalImpressions);
