import { getGmailClient } from "./gmail.service.js";

// services/gmailSearch.js
export const searchGmailThreadIds = async ({ gmail, search, folder, max = 200 }) => {
  const parts = [search.trim()];
  if (folder === "inbox") parts.push("in:inbox");
  if (folder === "sent") parts.push("in:sent");

  const { data } = await gmail.users.threads.list({
    userId: "me",
    q: parts.join(" "),
    maxResults: max,          // API allows up to 500 per page
    includeSpamTrash: false,
  });

  return (data.threads || []).map((t) => t.id);
};





// services/gmailSearch.js
const searchCache = new Map();
const TTL = 60_000;

export const getGmailSearchIds = async (req) => {
  const search = req.query.search?.trim();
  const { companyName, folder } = req.query;
  if (!search || !companyName) return [];

  const key = `${companyName}|${folder || ""}|${search.toLowerCase()}`;
  const hit = searchCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise;

  if (searchCache.size > 200) searchCache.clear();

  const promise = (async () => {
    try {
      const gmail = await getGmailClient(companyName);
      return await searchGmailThreadIds({ gmail, search, folder });
    } catch (err) {
      console.error("Gmail search failed, falling back to Mongo only:", err.message);
      searchCache.delete(key); // don't cache failures
      return [];
    }
  })();

  searchCache.set(key, { promise, expires: Date.now() + TTL });
  return promise;
};