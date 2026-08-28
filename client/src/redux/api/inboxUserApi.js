import { api } from "./api";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInboxUsers: builder.query({
      query: () => ({
        url: "/api/v1/user/get_all/users",
        method: "GET",
        params: {
          module: "inbox",
        },
      }),

      transformResponse: (response) => {
        return (
          response?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission?.includes("Inbox")
            )
          ) || []
        );
      },

      providesTags: ["InboxUser"],
    }),

    getActiveInboxTeam: builder.query({
      query: () => ({
        url: "/api/v1/user/get/active/team",
        method: "GET",
      }),

      transformResponse: (response) => {
        return (
          response?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission?.includes("Inbox")
            )
          ) || []
        );
      },

      providesTags: ["InboxUser"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetInboxUsersQuery,
  useGetActiveInboxTeamQuery,
} = usersApi;