import { api } from "./api";

export const whatsappCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWhatsappCategories: builder.query({
      query: () => ({
        url: "/api/v1/whatsapp/category",
        method: "GET",
      }),

      transformResponse: (response) => {
        return response?.categories || response;
      },

      providesTags: ["WhatsappCategory"],
    }),

    createWhatsappCategory: builder.mutation({
      query: (data) => ({
        url: "/api/v1/whatsapp/category",
        method: "POST",
        data,
      }),

      invalidatesTags: ["WhatsappCategory"],
    }),

    updateWhatsappCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/v1/whatsapp/category/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: ["WhatsappCategory"],
    }),

    deleteWhatsappCategory: builder.mutation({
      query: (id) => ({
        url: `/api/v1/whatsapp/category/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["WhatsappCategory"],
    }),
  }),
});

export const {
  useGetWhatsappCategoriesQuery,
  useCreateWhatsappCategoryMutation,
  useUpdateWhatsappCategoryMutation,
  useDeleteWhatsappCategoryMutation,
} = whatsappCategoryApi;