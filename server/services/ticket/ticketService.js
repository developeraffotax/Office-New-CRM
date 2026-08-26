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
    const safeSearch = escapeRegex(search.trim());
    const regex = new RegExp(safeSearch, "i");
    const orConditions = [{ subject: regex }, { clientName: regex }, { companyName: regex }, { email: regex }];
    if (/\d/.test(safeSearch)) {
      orConditions.push({ $expr: { $regexMatch: { input: { $toString: "$ticketRef" }, regex: safeSearch } } });
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