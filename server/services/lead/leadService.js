// services/leadService.js
import { LEAD_ALLOWED_FIELDS } from "../../constants/lead.js";
 
import Lead from "../../models/leadModel.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
 

export async function getAllLeadsService({
  brand,
  fields,
  page = 1,
  limit = 50,
  stage,
  status,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}) {
  const filter = {};
  if (brand) filter.brand = brand;
  if (stage) filter.stage = stage;
  if (status) filter.status = status;

  // search across clientName, email, companyName, and leadRef (number field)
  if (search && search.trim().length >= 1) {
    const safeSearch = escapeRegex(search.trim());
    const regex = new RegExp(safeSearch, "i");

    const orConditions = [
      { clientName: regex },
      { companyName: regex },
      { email: regex },
    ];

    // only bother with the leadRef match if the search looks numeric-ish,
    // avoids a pointless $expr scan when someone searches a name
    if (/\d/.test(safeSearch)) {
      orConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toString: "$leadRef" },
            regex: safeSearch,
          },
        },
      });
    }

    filter.$or = orConditions;
  }

  // sanitize requested fields against the whitelist
  let projection = null;
  if (fields) {
    const requested = fields.split(",").map((f) => f.trim());
    const safeFields = requested.filter((f) => LEAD_ALLOWED_FIELDS.includes(f));
    if (safeFields.length) projection = safeFields.join(" ");
  }

  // never let an unbounded limit through
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // sortBy also becomes a raw object key — whitelist it too
  const safeSortBy = LEAD_ALLOWED_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const query = Lead.find(filter);
  if (projection) query.select(projection);

  const [leads, total] = await Promise.all([
    query
      .sort({ [safeSortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    leads,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
}