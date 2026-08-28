import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

/**
 * Single RTK Query "root" for the CRM. Feature files (templatesApi,
 * signaturesApi, and anything you add later — canned WhatsApp replies,
 * ticket macros, etc.) call `api.injectEndpoints` instead of each creating
 * their own `createApi` instance.
 *
 * Why this matters at your scale: every extra `createApi` instance is a
 * separate reducer + separate middleware you have to remember to wire into
 * the store. With injectEndpoints, adding a new cached entity is a new file
 * with zero store.js changes.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Template", "Signature", "InboxUser", "InboxCategory"],
  endpoints: () => ({}),
});