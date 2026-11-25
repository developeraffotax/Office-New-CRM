import useProductPanel from "../hooks/useProductPanel.js";
import Skeleton from "../../shared/ui/Skeleton.jsx";
import { XIcon } from "../../shared/ui/Icons.jsx";
import ProductDetailsForm from "./ProductDetailsForm.jsx";
import DocumentUploader from "./DocumentUploader.jsx";
import DocumentList from "./DocumentList.jsx";
import ProductPanelSkeleton from "./ProductPanelSkeleton.jsx";

export default function ProductPanel({ productId, onClose }) {
  const { product, docs, form, setForm, saving, uploading, inputRef, dirty, save, upload, removeDoc, retryDoc } = useProductPanel(productId, onClose);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-gray-900/30 backdrop-blur-[2px]" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-label="Product details"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          {product ? <h2 className="truncate text-lg font-semibold tracking-tight text-gray-900">{product.name}</h2> : <Skeleton className="h-6 w-48" />}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </header>

        {product ? (
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
            <ProductDetailsForm form={form} setForm={setForm} dirty={dirty} saving={saving} onSave={save} />

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Documents</h3>
              <DocumentUploader uploading={uploading} onUpload={upload} inputRef={inputRef} />
              <DocumentList docs={docs} onRetry={retryDoc} onDelete={removeDoc} />
            </section>
          </div>
        ) : (
          <ProductPanelSkeleton />
        )}
      </aside>
    </div>
  );
}
