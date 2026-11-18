// Admin page: Project > Product > description + documents. Everything here feeds the AI assistant.
// Stack: React, Tailwind, react-hot-toast. Auth: see aiApi.js (getToken).
//
// Layout only. State and API calls live in knowledge-base/hooks/, pieces in knowledge-base/components/.
import useKnowledgeBase from "./knowledge-base/hooks/useKnowledgeBase.js";
import ProjectSidebar from "./knowledge-base/components/ProjectSidebar.jsx";
import ProjectHeader from "./knowledge-base/components/ProjectHeader.jsx";
import ProductGrid from "./knowledge-base/components/ProductGrid.jsx";
import KnowledgeEmpty from "./knowledge-base/components/KnowledgeEmpty.jsx";
import MainSkeleton from "./knowledge-base/components/MainSkeleton.jsx";
import FormModal from "./knowledge-base/components/FormModal.jsx";
import ProductPanel from "./knowledge-base/components/ProductPanel.jsx";

export default function KnowledgeBase() {
  const kb = useKnowledgeBase();
  const { project, modal, setModal } = kb;

  return (
    <div className="flex h-full bg-[#faf9f7] font-inter">
      <ProjectSidebar
        projects={kb.projects}
        projectId={kb.projectId}
        loading={kb.loading}
        onSelect={kb.setProjectId}
        onNew={() => setModal({ kind: "project" })}
      />

      <main className="flex-1 overflow-y-auto p-8">
        {kb.loading ? (
          <MainSkeleton />
        ) : !project ? (
          <KnowledgeEmpty onCreate={() => setModal({ kind: "project" })} />
        ) : (
          <>
            <ProjectHeader
              project={project}
              onEdit={() => setModal({ kind: "project", item: project })}
              onDelete={() => kb.deleteProject(project)}
              onNewProduct={() => setModal({ kind: "product" })}
            />
            <ProductGrid
              products={kb.products}
              loading={kb.productsLoading}
              projectName={project.name}
              onOpen={kb.setProductId}
              onDelete={kb.deleteProduct}
            />
          </>
        )}
      </main>

      {modal?.kind === "project" && (
        <FormModal kind="project" initial={modal.item} onSubmit={kb.submitProject} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "product" && (
        <FormModal kind="product" onSubmit={kb.submitProduct} onClose={() => setModal(null)} />
      )}
      {kb.productId && <ProductPanel productId={kb.productId} onClose={kb.closePanel} />}
    </div>
  );
}
