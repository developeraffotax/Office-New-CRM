import { api } from "./api";

export const mailboxApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // `endpoint` stays a call-time param (not hardcoded) so this same query
    // can be reused for other thread sources later (e.g. WhatsApp) without
    // touching call sites like Mailbox.js
    getMailbox: builder.query({
      query: ({ endpoint, ...params }) => ({ url: endpoint, params }),
      providesTags: (result) =>
        result?.threads
          ? [
              ...result.threads.flatMap((t) => [
                { type: "Thread", id: t._id },
                { type: "Thread", id: t.threadId },
              ]),
              { type: "Thread", id: "LIST" },
            ]
          : [{ type: "Thread", id: "LIST" }],
    }),

    getThread: builder.query({
      query: ({ threadId, companyName }) => ({
        url: `/api/v1/gmail/get-thread/${threadId}`,
        params: { companyName },
      }),
      providesTags: (result, error, { threadId }) =>
        result?.thread
          ? [{ type: "Thread", id: result.thread._id }, { type: "Thread", id: threadId }]
          : [{ type: "Thread", id: threadId }],
    }),

    updateThread: builder.mutation({
      query: ({ _id, updateData }) => ({
        url: `/api/v1/gmail/update-thread/${_id}`,
        method: "put",
        data: updateData,
      }),
      invalidatesTags: (result) =>
        result?.thread
          ? [
              { type: "Thread", id: result.thread._id },
              { type: "Thread", id: result.thread.threadId },
              { type: "Thread", id: "LIST" },
            ]
          : [],
    }),

    bulkUpdateThreads: builder.mutation({
      query: ({ threadIds, updates }) => ({
        url: "/api/v1/gmail/bulk-update-thread",
        method: "patch",
        data: { threadIds, updates },
      }),
      invalidatesTags: [{ type: "Thread", id: "LIST" }],
    }),

    // star/read/unread are patched optimistically by the hook itself (it
    // already knows which getMailbox cache entry to touch), but each also
    // invalidates its own thread's tag so a mounted single-thread page
    // (MailThreadPage) picks up the change too. That does mean an extra
    // background refetch of the list alongside the optimistic patch —
    // harmless (no loading flicker, previous data stays visible), traded
    // for automatic cross-page sync.
    toggleStar: builder.mutation({
      query: ({ threadId, companyName }) => ({
        url: `/api/v1/gmail/star/${threadId}`,
        method: "patch",
        data: { companyName },
      }),
      invalidatesTags: (result, error, { threadId }) => [{ type: "Thread", id: threadId }],
    }),

    markAsRead: builder.mutation({
      query: ({ threadId, companyName }) => ({
        url: `/api/v1/gmail/mark-as-read/${threadId}`,
        method: "patch",
        data: { companyName },
      }),
      invalidatesTags: (result, error, { threadId }) => [{ type: "Thread", id: threadId }],
    }),

    markAsUnread: builder.mutation({
      query: ({ threadId, companyName }) => ({
        url: `/api/v1/gmail/mark-as-unread/${threadId}`,
        method: "patch",
        data: { companyName },
      }),
      invalidatesTags: (result, error, { threadId }) => [{ type: "Thread", id: threadId }],
    }),

    deleteThread: builder.mutation({
      query: ({ threadId, companyName }) => ({
        url: `/api/v1/gmail/delete/${threadId}`,
        method: "delete",
        data: { companyName },
      }),
      invalidatesTags: (result, error, { threadId }) => [
        { type: "Thread", id: threadId },
        { type: "Thread", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMailboxQuery,
  useGetThreadQuery,
  useUpdateThreadMutation,
  useBulkUpdateThreadsMutation,
  useToggleStarMutation,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useDeleteThreadMutation,
} = mailboxApi;