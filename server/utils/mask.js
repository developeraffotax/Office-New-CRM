/**
 * Utility to mask an email address (e.g., "haris@affotax.com" -> "ha***@affotax.com")
 */
export const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  // Keeps the first 2 letters, adds asterisks, and keeps the last letter of the local part
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
};

/**
 * Utility to mask a phone number (e.g., "03159935149" -> "031*****149")
 */
export const maskPhone = (phone) => {
  if (!phone) return phone;
  const str = phone.toString().trim();
  
  if (str.length <= 6) {
    return "***-***";
  }
  // Keeps the first 3 digits and the last 4 digits, masking everything in between
  return `${str.slice(0, 3)}****${str.slice(-4)}`;
  //return `${str.slice(0, 3)}*****${str.slice(-3)}`;
};