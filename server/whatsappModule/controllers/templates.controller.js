import { getCompanies } from "../utils/config.js";
import { getWhatsappTemplates } from "../utils/whatsappApi.js";






export const getAllTemplates = async (req, res, next) => {
  try {
    const { companyName } = req.query;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Missing companyName query parameter",
      });
    }

    const wabaId = getCompanies()[companyName]?.wabaId;

    if (!wabaId) {
      return res.status(400).json({
        success: false,
        message: `No WABA ID configured for company "${companyName}"`,
      });
    }

    const { data: templates } = await getWhatsappTemplates(wabaId);

    res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    next(error);
  }
};