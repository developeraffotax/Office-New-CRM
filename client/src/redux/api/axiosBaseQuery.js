import axios from "axios";

/**
 * Lets RTK Query endpoints go through the same axios instance (and any
 * auth/interceptor logic) the rest of the app already relies on, instead of
 * switching every request to fetchBaseQuery.
 *
 * Usage inside createApi: baseQuery: axiosBaseQuery()
 * Usage inside an endpoint's `query`: return { url, method, params, data }
 */
export const axiosBaseQuery =
  ({ baseUrl = process.env.REACT_APP_API_URL } = {}) =>
  async ({ url, method = "get", data, params }) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };