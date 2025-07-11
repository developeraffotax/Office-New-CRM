import { google } from "googleapis";
import { GoogleAuth, JWT } from "google-auth-library";
import jobsModel from "../models/jobsModel.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const SHEET_ID = "1P5MY1-LD8pmEDwNIxILeLlKzcApKLKfRNcUtDoZnsnY";
const ACTIVE_SHEET_RANGE = "Client_jobs!A1";
const COMPLETED_SHEET_RANGE = "Completed!A1";
const INACTIVE_SHEET_RANGE = "Inactive_Clients!A1";

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for Credentials
const CREDENTIALS_PATH = path.join(
  __dirname,
  "..",
  "creds",
  "credentials.json"
);



// Create a JWT client using the Service Account key
const jwtClient = new JWT({
  keyFile: CREDENTIALS_PATH,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
   
});




// Authenticate with Google Sheets
const authenticateGoogleSheets = async () => {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}`);
  }


      


  const auth = new GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });


 
  return await auth.getClient();
};

const flattenClientData = (client) => {
  const {
    _id,
    clientName,
    regNumber,
    companyName,
    email,
    totalHours,
    currentDate,
    source,
    clientType,
    country,
    fee,
    ctLogin,
    pyeLogin,
    trLogin,
    vatLogin,
    authCode,
    utr,
    isActive,
    job,
    totalTime,
    createdAt,
    updatedAt,
    label,
  } = client;

  return [
    _id.toString(),
    clientName,
    regNumber,
    companyName,
    email,
    totalHours,
    currentDate ? new Date(currentDate).toLocaleDateString() : "",
    source,
    clientType,
    country,
    fee,
    ctLogin,
    pyeLogin,
    trLogin,
    vatLogin,
    authCode,
    utr,
    isActive ? "Yes" : "No",
    job ? job.jobName : "",
    job && job.yearEnd ? new Date(job.yearEnd).toLocaleDateString() : "",
    job && job.jobDeadline
      ? new Date(job.jobDeadline).toLocaleDateString()
      : "",
    job ? job.hours : "",
    job ? job.fee : "",
    job ? job.jobStatus : "",
    job ? job.lead : "",
    job ? job.jobHolder : "",
    totalTime,
    new Date(createdAt).toLocaleDateString(),
    new Date(updatedAt).toLocaleDateString(),
    label ? label.name : "",
    label ? label.color : "",
  ];
};

// Update Google Sheet with flattened data
const updateGoogleSheet = async (data, range) => {
  try {


    //const authClient = await authenticateGoogleSheets();


          await jwtClient.authorize();

    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    const header = [
      "ID",
      "Client Name",
      "Reg Number",
      "Company Name",
      "Email",
      "Total Hours",
      "Current Date",
      "Source",
      "Client Type",
      "Country",
      "Fee",
      "CT Login",
      "PYE Login",
      "TR Login",
      "VAT Login",
      "Auth Code",
      "UTR",
      "Active",
      "Job Name",
      "Year End",
      "Job Deadline",
      "Hours",
      "Job Fee",
      "Job Status",
      "Lead",
      "Job Holder",
      "Total Time",
      "Created At",
      "Updated At",
      "Label Name",
      "Label Color",
    ];
    const rows = data.map(flattenClientData);

    // Clear existing data on the specified sheet range
    const clearRange = range.split("!")[0] + "!A1:Z1000";

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: clearRange,
    });

    console.log("range:", range);

    // Append new data to the specified sheet range
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: "RAW",
      requestBody: {
        values: [header, ...rows],
      },
    });
    console.log(`Google Sheet updated successfully at ${range}`);
  } catch (error) {
    console.error("Error updating Google Sheet:", error);
    throw error;
  }
};

// Send data to Google Sheets
export const sendDatatoGoogleSheet = async () => {
  try {
    // Fetch active clients
    const activeClients = await jobsModel
      .find({
        status: { $ne: "completed" },
        "job.jobStatus": { $ne: "Inactive" },
      })
      .populate("data");

    // Fetch completed clients
    const completedClients = await jobsModel
      .find({ status: "completed" })
      .populate("data");

    // Inactive Clients
    const inactiveClients = await jobsModel
      .find({ "job.jobStatus": "Inactive" })
      .populate("data");

    // Update both sheets
    await updateGoogleSheet(activeClients, ACTIVE_SHEET_RANGE);
    await updateGoogleSheet(completedClients, COMPLETED_SHEET_RANGE);
    await updateGoogleSheet(inactiveClients, INACTIVE_SHEET_RANGE);

    console.log(
      "Google Sheets updated successfully with active, inactive and completed clients!"
    );
  } catch (error) {
    console.error(error);
  }
};
