export const buildConversationQuery = (filters) => {
  const params = {};

  if (filters.companyName) params.companyName = filters.companyName;

    if (filters.status) params.status = filters.status;

  if (filters.category) params.category = filters.category;

  if (filters.userId) params.userId = filters.userId;

  if (filters.startDate) params.startDate = filters.startDate;

  if (filters.endDate) params.endDate = filters.endDate;

  if (filters.search?.trim())
    params.search = filters.search.trim();

  if (filters.lastMessageBy)
    params.lastMessageBy = filters.lastMessageBy;

  if (filters.unreadOnly)
    params.unreadOnly = filters.unreadOnly;

  if (filters.starred)
    params.starred = filters.starred;

  params.page = filters.page;
  params.limit = filters.limit;

  return params;
};