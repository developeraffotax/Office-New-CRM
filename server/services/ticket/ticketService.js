// services/ticketService.js
import Ticket from "../../models/ticketModel.js";
import { TICKET_ALLOWED_FIELDS } from "../../constants/ticket.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
 
export async function getAllTicketsService({
  company, fields, page = 1, limit = 50, state, search,
  sortBy = "createdAt", sortOrder = "desc",
}) {
  const filter = {};
  if (company) filter.company = company;
  if (state) filter.state = state;

  if (search && search.trim()) {
    const trimmedSearch = search.trim();
    const safeSearch = escapeRegex(trimmedSearch);
    const regex = new RegExp(safeSearch, "i");
    const orConditions = [{ subject: regex }, { clientName: regex }, { companyName: regex }, { email: regex }];

    // accept "T-1234", "t1234", or plain "1234" as equivalent ticketRef searches.
    // refMatch[1] is digits-only from the regex, so it's already safe —
    // no need to re-escape it like safeSearch.
    const refMatch = trimmedSearch.match(/^t-?(\d+)$/i);
    const ticketRefSearch = refMatch ? refMatch[1] : safeSearch;

    if (/\d/.test(ticketRefSearch)) {
      orConditions.push({ $expr: { $regexMatch: { input: { $toString: "$ticketRef" }, regex: ticketRefSearch } } });
    }
    filter.$or = orConditions;
  }

  let projection = null;
  if (fields) {
    const safeFields = fields.split(",").map((f) => f.trim()).filter((f) => TICKET_ALLOWED_FIELDS.includes(f));
    if (safeFields.length) projection = safeFields.join(" ");
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const safeSortBy = TICKET_ALLOWED_FIELDS.includes(sortBy) ? sortBy : "createdAt";

  const query = Ticket.find(filter);
  if (projection) query.select(projection);

  const [tickets, total] = await Promise.all([
    query.sort({ [safeSortBy]: sortOrder === "asc" ? 1 : -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Ticket.countDocuments(filter),
  ]);

  return { tickets, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } };
}