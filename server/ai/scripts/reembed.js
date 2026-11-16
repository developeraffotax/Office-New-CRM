// ai/scripts/reembed.js — run after changing EMBED_PROVIDER / EMBED_MODEL / EMBED_DIMS:
//   node ai/scripts/reembed.js
// Re-embeds every chunk that was made with a different embedding model. Spreadsheets aren't affected.
// Keep EMBED_DIMS at 1024 and the Atlas vector index doesn't need to change. A different size needs a new index.
import mongoose from "mongoose";
import { KbChunk } from "../models/kb.models.js";
import { embed, EMBED_ID } from "../core/llm.js";

await mongoose.connect(process.env.MONGO_URI);
console.log(`Re-embedding chunks to ${EMBED_ID}`);

let done = 0;
for (;;) {
  const batch = await KbChunk.find({ embeddingModel: { $ne: EMBED_ID } }).limit(64).select("text source");
  if (!batch.length) break;
  const vectors = await embed(batch.map((c) => `${c.source?.product} | ${c.source?.file}\n${c.text}`), "document");
  await KbChunk.bulkWrite(
    batch.map((c, i) => ({ updateOne: { filter: { _id: c._id }, update: { $set: { embedding: vectors[i], embeddingModel: EMBED_ID } } } }))
  );
  done += batch.length;
  console.log(`  ${done} done`);
}
console.log("Finished.");
await mongoose.disconnect();
