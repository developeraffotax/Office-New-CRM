import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  HiArrowPath, HiTrash, HiPlus, HiPencilSquare, 
  HiXMark, HiMagnifyingGlass, HiOutlineFolderOpen 
} from "react-icons/hi2";
import ProjectFormModal from "./ProjectFormModal"; // We will create this next
import { MdLibraryAddCheck } from "react-icons/md";
import { ConfirmDialog, useConfirm } from "../../../utlis/ConfirmDialog/ConfirmDialog";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/v1/ai/project`;
const STORAGE_KEY = "ai_selected_project";

export default function AiProjectManager({ onClose, onSelect, project, companyName }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Secondary Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/all?companyName=${companyName}`);
      setProjects(data.projects || []);
    } catch (err) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

     const { confirm, dialogProps } = useConfirm();





const handleDelete = async (id, companyName) => {
   const ok = await confirm({
       title: "Delete Configuration",
       message: "This will permanently remove the project. This action cannot be undone.",
       detail: companyName,
       confirmLabel: "Delete",
       cancelLabel: "Cancel",
       variant: "danger",
     });
     if (!ok) return;

  try {
    await axios.delete(`${API_BASE}/${id}`);

    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-${companyName}`) || "{}");
    if (saved._id === id) {
      localStorage.removeItem(`${STORAGE_KEY}-${companyName}`);
    }
    if (id === project?._id) {
      onSelect({ _id: "", name: "", companyName: "" });
    }

    toast.success("Project removed");
    fetchProjects();
  } catch (err) {
    toast.error("Delete failed");
    console.log("ERROR", err)
  }
};

  const openForm = (project = null) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };



  const onProjectSelect = (project) => {

  if(project?.companyName) {
    localStorage.setItem(`${STORAGE_KEY}-${project.companyName}`, JSON.stringify(project));
  }
   onSelect(project)
    

}




  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
         <ConfirmDialog {...dialogProps} />
      {/* List Modal Container */}
      <div className="relative bg-white w-full max-w-4xl max-h-[85vh] min-h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Projects</h2>
             
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <HiXMark className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-80">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Search by name or company..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={fetchProjects} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <HiArrowPath className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => openForm()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 transition-transform active:scale-95"
            >
              <HiPlus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
              <div  key={item._id} className=" group p-5 bg-white border border-slate-200 rounded-2xl hover:border-orange-400 hover:shadow-md transition-all relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                    <p className="text-sm text-slate-500 mb-3">{item.companyName}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-md uppercase border border-orange-100">
                        {item.aiConfig?.tone || 'Professional'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        const selected = {
                          _id: item._id,
                          name: item.name,
                          companyName: item.companyName
                        };
                        onProjectSelect(selected);
                      }}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                    >
                      <MdLibraryAddCheck className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => openForm(item)}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                    >
                      <HiPencilSquare className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id, item.companyName)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {
                  (item._id === project?._id) && <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded-lg absolute bottom-3 right-3 animate-pop"> Selected </span>
                }
              </div>
            ))}
          </div>
          
          {projects.length === 0 && !loading && (
            <div className="text-center py-20">
              <HiOutlineFolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No projects found. Create one to start training your AI.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL POPUP 2: THE FORM */}
      {isFormOpen && (
        <ProjectFormModal 
          project={selectedProject} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchProjects();
          }} 
        />
      )}
    </div>
  );
}