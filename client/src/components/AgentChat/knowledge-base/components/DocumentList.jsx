import DocumentRow from "./DocumentRow.jsx";

export default function DocumentList({ docs, onRetry, onDelete }) {
  if (docs.length === 0)
    return <p className="mt-3 text-sm text-gray-500">No documents yet. Upload policies, guides, SOPs or spreadsheets for this product.</p>;
  return (
    <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
      {docs.map((d) => (
        <DocumentRow key={d._id} d={d} onRetry={onRetry} onDelete={onDelete} />
      ))}
    </ul>
  );
}
