import axios from "axios";

// Your API key and site URL
const API_KEY = "AIzaSyBF1-ID0nkYwe9m4sy9XzhgYWCk0erbg5w";
const siteUrl = "https://www.affotax.com/";

// Prepare the request payload
const requestPayload = {
  startDate: "2024-10-01",
  endDate: "2024-10-28",
  dimensions: ["country", "device"],
};

// export const fetchSearchAnalytics = async () => {
//   try {
//     const response = await axios.post(
//       `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
//         siteUrl
//       )}/searchAnalytics/query?key=${API_KEY}`,
//       {
//         startDate: "2024-10-01",
//         endDate: "2024-10-28",
//         dimensions: ["country", "device"],
//       }
//     );

//     console.log("response:", response);
//     const { rows } = response.data;

//     if (rows && rows.length > 0) {
//       console.log("Search Analytics Data:", rows);
//     } else {
//       console.log("No data available for the specified period.");
//     }
//   } catch (error) {
//     console.error("Error fetching search analytics:", error.message);
//   }
// };

export const fetchSearchAnalytics = async () => {
  try {
    const response = await axios.post(
      `https://www.googleapis.com/webmasters/v3/sites/sc-domain:affotax.com/searchAnalytics/query?key=${API_KEY}`,
      {
        startDate: "2024-10-01",
        endDate: "2024-10-28",
        dimensions: ["country", "device"],
      }
    );

    console.log("response:", response);
    const { rows } = response.data;

    if (rows && rows.length > 0) {
      console.log("Search Analytics Data:", rows);
    } else {
      console.log("No data available for the specified period.");
    }
  } catch (error) {
    console.error("Error fetching search analytics:", error.message);
  }
};
