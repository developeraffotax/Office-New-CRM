import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { kbHttp as api, errMsg } from "../../aiApi.js";

// Projects > products state and the create / edit / delete actions for the page.
export default function useKnowledgeBase() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(null);
  const [modal, setModal] = useState(null); // { kind: "project" | "product", item? }
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true); // display only

  const loadProjects = useCallback(async (selectId) => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
      setProjectId((cur) => selectId ?? (data.some((p) => p._id === cur) ? cur : data[0]?._id ?? null));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (!projectId) {
      setProductsLoading(false);
      return setProducts([]);
    }
    setProductsLoading(true);
    try {
      const { data } = await api.get(`/projects/${projectId}/products`);
      setProducts(data);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setProductsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { setProductId(null); loadProducts(); }, [loadProducts]);

  const project = projects.find((p) => p._id === projectId);

  const submitProject = async (form) => {
    try {
      if (modal.item) {
        await api.patch(`/projects/${modal.item._id}`, { name: form.name, description: form.description });
        await loadProjects();
        toast.success("Project updated");
      } else {
        const { data } = await api.post("/projects", { name: form.name, description: form.description });
        await loadProjects(data._id);
        toast.success("Project created");
      }
      setModal(null);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const submitProduct = async (form) => {
    try {
      const { data } = await api.post(`/projects/${projectId}/products`, form);
      setModal(null);
      await Promise.all([loadProducts(), loadProjects(projectId)]);
      setProductId(data._id); // open it straight away so files can be added
      toast.success("Product created");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete "${p.name}" with all its products and documents? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${p._id}`);
      await loadProjects();
      toast.success("Project deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}" and its documents? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      await Promise.all([loadProducts(), loadProjects(projectId)]);
      toast.success("Product deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const closePanel = () => {
    setProductId(null);
    loadProducts();
  };

  return {
    projects, projectId, setProjectId, project, products, productId, setProductId,
    modal, setModal, loading, productsLoading,
    submitProject, submitProduct, deleteProject, deleteProduct, closePanel,
  };
}
