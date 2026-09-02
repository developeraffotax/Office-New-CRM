

export function parseEmail(str) {
  if (!str) return "";

  // Match anything that looks like an email
  const emailMatch = str.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );

  return emailMatch ? emailMatch[0] : "";
}


export function getMyEamilFromCompanyName(myCompanyName) {
  if (!myCompanyName) return "";

    const myEmail =
    myCompanyName === "affotax"
      ? "info@affotax.com"
      : "admin@outsourceaccountings.co.uk";
 
  return myEmail;
}




