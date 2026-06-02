 

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




export const getCompanyByPhoneNumber = (phoneNumber) => {
  const companies = getCompanies();

  console.log("COMPANIES", companies)
  return Object.entries(companies).find(
    ([_, company]) => company.phoneNumber === phoneNumber
  )?.[0];
};