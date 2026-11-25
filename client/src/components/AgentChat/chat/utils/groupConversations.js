// Groups saved chats (newest first) under Today / Yesterday / Previous 7 days / Older.
const DAY = 86_400_000;

export function groupConversations(list, now = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const buckets = [["Today", []], ["Yesterday", []], ["Previous 7 days", []], ["Older", []]];
  for (const c of list) {
    const t = new Date(c.lastMessageAt).getTime();
    const i = t >= startOfToday ? 0 : t >= startOfToday - DAY ? 1 : t >= startOfToday - 7 * DAY ? 2 : 3;
    buckets[i][1].push(c);
  }
  return buckets.filter(([, items]) => items.length).map(([label, items]) => ({ label, items }));
}
