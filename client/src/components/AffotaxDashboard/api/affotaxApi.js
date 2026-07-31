import axios from "axios";

/**
 * The CRM (CRA) and the website (Next.js) are two separate origins,
 * so this instance points at the Next.js API routes explicitly instead
 * of relying on a relative "/api/..." path (that only worked inside
 * the Next.js app itself).
 *
 * Set REACT_APP_AFFOTAX_API_URL in the CRM's .env (CRA only exposes
 * vars prefixed with REACT_APP_):
 *
 *   REACT_APP_AFFOTAX_API_URL=https://affotax.com
 *
 * The Next.js side also needs to send CORS headers back for the CRM's
 * origin on these routes — see the README in this folder.
 */
const affotaxApi = axios.create({
  baseURL: process.env.REACT_APP_AFFOTAX_API_URL || "https://affotax.com",
  withCredentials: false, // flip to true only if these routes read an auth cookie/session
});

export default affotaxApi;
