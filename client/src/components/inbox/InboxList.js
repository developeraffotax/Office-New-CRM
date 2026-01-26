import InboxRow from "./InboxRow";

export default function InboxList({ threads, loading, users, handleUpdateThread }) {
  if (loading) {
    return <div className="p-4 text-sm">Loading inbox…</div>;
  }


  




  return (
    <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
      {threads.map((thread) => (
        <InboxRow key={thread._id} thread={thread} users={users} handleUpdateThread={handleUpdateThread} />
      ))}
    </div>
  );
}