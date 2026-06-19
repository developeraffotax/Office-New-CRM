export const is24hWindowOpen = (conversation) => {
  if (!conversation.lastInboundAt) return false;

  const diff =
    Date.now() - new Date(conversation.lastInboundAt).getTime();

  return diff < 24 * 60 * 60 * 1000;
};