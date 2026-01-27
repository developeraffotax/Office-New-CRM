import { google } from "googleapis";

export const getGmailClient = async (companyName) => {
  const COMPANY_CONFIG = {
    affotax: {
      name: "affotax",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
      refreshToken: process.env.REFRESH_TOKEN,
    },
    outsource: {
      name: "outsource",
      clientId: process.env.OUTSOURCE_CLIENT_ID,
      clientSecret: process.env.OUTSOURCE_CLIENT_SECRET,
      redirectUri: process.env.OUTSOURCE_REDIRECT_URI,
      refreshToken: process.env.OUTSOURCE_REFRESH_TOKEN,
    },
  };



  const config = COMPANY_CONFIG[companyName];

  if (!config) throw new Error("Invalid company name");



  const oauth = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  oauth.setCredentials({ refresh_token: config.refreshToken });

  return google.gmail({ version: "v1", auth: oauth });
};
