import { api } from "./api";

export const threadCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({
        url: "/api/v1/gmail/category",
        method: "GET",
      }),

      transformResponse: (response) => {
        return response?.categories || response;
      },

      providesTags: ["InboxCategory"],
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: "/api/v1/gmail/category",
        method: "POST",
        data,
      }),

      invalidatesTags: ["InboxCategory"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/v1/gmail/category/${id}`,
        method: "PUT",
        data,
      }),

      invalidatesTags: ["InboxCategory"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/api/v1/gmail/category/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["InboxCategory"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = threadCategoryApi;