import { google } from "googleapis";

export const getGmailClient = async (companyName) => {
  const COMPANY_CONFIG = {
    AFFOTAX: {
      name: "AFFOTAX",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
      refreshToken: process.env.REFRESH_TOKEN,
    },
    Outsource: {
      name: "Outsource",
      clientId: process.env.OUTSOURCE_CLIENT_ID,
      clientSecret: process.env.OUTSOURCE_CLIENT_SECRET,
      redirectUri: process.env.OUTSOURCE_REDIRECT_URI,
      refreshToken: process.env.OUTSOURCE_REFRESH_TOKEN,
    },
  };



  const config = COMPANY_CONFIG[companyName];
  console.log(config)
  if (!config) throw new Error("Invalid company name");

  console.log("CONFIG:", config); // Now values are defined

  const oauth = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  oauth.setCredentials({ refresh_token: config.refreshToken });

  return google.gmail({ version: "v1", auth: oauth });
};
