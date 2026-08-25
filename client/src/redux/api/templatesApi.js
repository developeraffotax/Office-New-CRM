import { api } from "./api";

export const templatesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query({
      query: (companyName) => ({
        url: "/api/v1/templates/get/all/template",
        params: { companyName },
      }),
      transformResponse: (response) => response?.templates || [],
      providesTags: ["Template"],
      
    }),

    // POST: Create Template
    // createTemplate: builder.mutation({
    //   query: (newTemplateData) => ({
    //     url: "/api/v1/templates/create",
    //     method: "post",
    //     data: newTemplateData, // Sent as the body in axios
    //   }),
    //   // Refetches getTemplates automatically across all components using it
    //   invalidatesTags: ["Template"], 
    // }),
    

    // When you add create/update/delete template endpoints (wherever
    // templates get managed), give them `invalidatesTags: ["Template"]`.
    // Every picker using useGetTemplatesQuery — this file and ChatWindow's
    // reply picker — refetches automatically. No manual "reload templates
    // in both places" code needed.
  }),
  overrideExisting: false,
});

export const { useGetTemplatesQuery } = templatesApi;