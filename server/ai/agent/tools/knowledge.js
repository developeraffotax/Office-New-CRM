// ai/agent/tools/knowledge.js
import { retrieve } from "../../rag/retrieve.js";

export const knowledgeTools = [
  {
    name: "search_knowledge",
    description:
      "Search the company knowledge base (documents, policies, product descriptions) by meaning and keywords. Use it when the passages already provided do not answer the question, or to look up another topic. Not for spreadsheet data.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to look for, in natural language." },
        productId: { type: "string", description: "Optional: only search one product (id from earlier results)." },
      },
      required: ["query"],
    },
    async execute({ query, productId }, ctx) {
      const chunks = await retrieve({ query, user: ctx.user, productId: productId || ctx.scope.productId, projectId: ctx.scope.projectId, topK: 5 });
      return ctx.addSources(chunks).map(({ n, chunk }) => ({
        n, // cite as [n]
        source: `${chunk.source?.project} > ${chunk.source?.product} > ${chunk.source?.file}`,
        text: chunk.text.slice(0, 1800),
      }));
    },
  },
];
