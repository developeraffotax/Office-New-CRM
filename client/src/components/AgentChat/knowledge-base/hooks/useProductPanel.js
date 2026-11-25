import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { kbHttp as api, errMsg } from "../../aiApi.js";
import useEscapeKey from "../../shared/hooks/useEscapeKey.js";

// One product: its details form, its documents, upload / delete / retry, and indexing poll.
export default function useProductPanel(productId, onClose) {
  const [product, setProduct] = useState(null);
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", allowedRoles: [] });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(
    async (resetForm) => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setDocs(data.documents);
        if (resetForm) {
          setProduct(data.product);
          setForm({
            name: data.product.name,
            description: data.product.description || "",
            allowedRoles: data.product.allowedRoles || [],
          });
        }
      } catch (e) {
        toast.error(errMsg(e));
      }
    },
    [productId]
  );

  useEffect(() => {
    setProduct(null);
    load(true);
  }, [load]);

  // Poll while any file is still being indexed.
  const busy = docs.some((d) => d.status === "queued" || d.status === "processing");
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => load(false), 3000);
    return () => clearInterval(t);
  }, [busy, load]);

  useEscapeKey(onClose);

  const dirty =
    product &&
    (form.name !== product.name ||
      form.description !== (product.description || "") ||
      JSON.stringify([...form.allowedRoles].sort()) !== JSON.stringify([...(product.allowedRoles || [])].sort()));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/products/${productId}`, form);
      setProduct(data);
      toast.success("Product saved");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const upload = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    setUploading(true);
    try {
      await api.post(`/products/${productId}/documents`, body);
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
      await load(false);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeDoc = async (d) => {
    if (!window.confirm(`Delete "${d.filename}"? The assistant will stop using it.`)) return;
    try {
      await api.delete(`/documents/${d._id}`);
      setDocs((x) => x.filter((y) => y._id !== d._id));
      toast.success("Document deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const retryDoc = async (d) => {
    try {
      await api.post(`/documents/${d._id}/retry`);
      await load(false);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return { product, docs, form, setForm, saving, uploading, inputRef, dirty, save, upload, removeDoc, retryDoc };
}
