import { api } from "./api";

export const whatsappUsersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWhatsappUsers: builder.query({
      query: () => ({
        url: "/api/v1/user/get_all/users",
        method: "GET",
        params: {
          module: "whatsapp",
        },
      }),

      transformResponse: (response) => {
        return (
          response?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission?.includes("Whatsapp")
            )
          ) || []
        );
      },

      providesTags: ["WhatsappUser"],
    }),

    getActiveWhatsappTeam: builder.query({
      query: () => ({
        url: "/api/v1/user/get/active/team",
        method: "GET",
      }),

      transformResponse: (response) => {
        return (
          response?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission?.includes("Whatsapp")
            )
          ) || []
        );
      },

      providesTags: ["WhatsappUser"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetWhatsappUsersQuery,
  useGetActiveWhatsappTeamQuery,
} = whatsappUsersApi;