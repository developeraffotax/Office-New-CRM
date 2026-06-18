export const getCompanies = () => ({
  affotax: {
    phoneNumber: process.env.WHATSAPP_AFFOTAX_PHONE_NUMBER,
    phoneNumberId: process.env.WHATSAPP_AFFOTAX_PHONE_NUMBER_ID,
  },

  outsource: {
    phoneNumber: process.env.WHATSAPP_OUTSOURCE_PHONE_NUMBER,
    phoneNumberId: process.env.WHATSAPP_OUTSOURCE_PHONE_NUMBER_ID,
  },
});



export const getCompanyByPhoneNumber = (phoneNumberId) => {
  const companies = getCompanies();

  return Object.entries(companies).find(
    ([_, company]) => company.phoneNumberId === phoneNumberId,
  )?.[0];
};
