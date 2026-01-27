import Row from "./Row";

// A internal component for the loading state
const ShimmerSkeleton = () => (
  <div className="relative overflow-hidden p-4 border-b border-gray-100 bg-white">
    <div className="flex items-center">
      {/* Avatar Circle */}
      {/* <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" /> */}
      
      <div className="flex-1 space-y-3">
        {/* Name & Time */}
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
        {/* Subject/Snippet */}
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-50 rounded w-2/3" />
      </div>
    </div>
    
    {/* The Shimmer Effect Layer */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export default function  List({ threads, loading, users, handleUpdateThread, setEmailDetail, categories }) {
  if (loading) {
    return (
      <div className="flex-1 overflow-hidden">
        {/* Render 6 skeleton rows to fill the screen */}
        {[...Array(6)].map((_, i) => (
          <ShimmerSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return <div className="p-8 text-center text-gray-500">No messages found.</div>;
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
      {threads.map((thread) => (
        <Row 
          key={thread._id} 
          thread={thread} 
          users={users} 
          handleUpdateThread={handleUpdateThread} 
          categories={categories}

          setEmailDetail={setEmailDetail}
           
        />
      ))}
    </div>
  );
}