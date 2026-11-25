// ai/rag/retrieve.js
// Hybrid retrieval: Atlas Vector Search + Atlas Search (keyword), merged with Reciprocal Rank Fusion.
// The role filter is applied INSIDE the queries, so restricted content never leaves the database.
import mongoose from "mongoose";
import { KbChunk } from "../models/kb.models.js";
import { embedQuery, EMBED_ID } from "../core/llm.js";
import { isAdminRole } from "../config.js";

const VECTOR_INDEX = process.env.KB_VECTOR_INDEX || "kb_vector_index";
const TEXT_INDEX = process.env.KB_TEXT_INDEX || "kb_text_index";
const oid = (id) => new mongoose.Types.ObjectId(String(id));

function buildFilter(user, { projectId, productId }) {
  const f = { embeddingModel: EMBED_ID }; // never compare vectors from different embedding models
  // Adjust `user.role` / the "admin" check to however your CRM models roles.
  if (!isAdminRole(user.role)) f.allowedRoles = { $in: [user.role, "all"] };
  if (projectId) f.projectId = oid(projectId);
  if (productId) f.productId = oid(productId);
  return f;
}

// $vectorSearch wants an explicit $and for multiple conditions.
function toVectorFilter(f) {
  const clauses = Object.entries(f).map(([k, v]) => ({ [k]: v }));
  if (!clauses.length) return undefined;
  return clauses.length === 1 ? clauses[0] : { $and: clauses };
}

const FIELDS = { embeddingModel: 1, text: 1, source: 1, productId: 1, documentId: 1, allowedRoles: 1, projectId: 1 };

function vectorSearch(queryVector, filter) {
  const stage = {
    $vectorSearch: { index: VECTOR_INDEX, path: "embedding", queryVector, numCandidates: 150, limit: 20 },
  };
  const vf = toVectorFilter(filter);
  if (vf) stage.$vectorSearch.filter = vf;
  return KbChunk.aggregate([stage, { $project: { ...FIELDS, score: { $meta: "vectorSearchScore" } } }]);
}

function keywordSearch(query, filter) {
  return KbChunk.aggregate([
    { $search: { index: TEXT_INDEX, text: { query, path: "text" } } },
    { $project: { ...FIELDS, score: { $meta: "searchScore" } } },
    { $limit: 50 },
    { $match: filter }, // ACL applied before anything is returned
    { $limit: 20 },
  ]);
}

function rrf(lists, topK, k = 60) {
  const merged = new Map();
  for (const list of lists) {
    list.forEach((doc, rank) => {
      const id = String(doc._id);
      const entry = merged.get(id) || { doc, score: 0 };
      entry.score += 1 / (k + rank + 1);
      merged.set(id, entry);
    });
  }
  return [...merged.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ doc }) => doc);
}

/**
 * @param {string} query   the user's question (plus the previous question for follow-ups)
 * @param {object} user    req.user: needs `role`
 * @param {object} scope   optional { projectId, productId } to narrow the search
 */
export async function retrieve({ query, user, projectId, productId, topK = 5 }) {
  const filter = buildFilter(user, { projectId, productId });

  // Keyword search doesn't need the embedding, so run both at the same time.
  const keywordP = keywordSearch(query, filter).catch(() => []); // vector-only if the text index isn't ready
  const vector = await vectorSearch(await embedQuery(query), filter);
  return rrf([vector, await keywordP], topK);
}
