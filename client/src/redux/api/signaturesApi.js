import { api } from "./api";

export const signaturesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSignatures: builder.query({
      query: (companyName) => ({
        url: "/api/v1/tickets/signatures",
        params: { companyName },
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: ["Signature"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSignaturesQuery } = signaturesApi;