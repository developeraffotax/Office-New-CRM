import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/v1/ai/project`;

const INITIAL_STATE = {
  name: "",
  companyName: "",
  aiConfig: { tone: "professional", instructions: "", signature: "", language: "English" },
  knowledge: { services: "", pricingNotes: "", faq: "" },
};

export default function ProjectFormModal({ project, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (project) {
      setForm({
        ...project,
        knowledge: { 
          ...project.knowledge, 
          services: Array.isArray(project.knowledge.services) 
            ? project.knowledge.services.join(", ") 
            : project.knowledge.services || ""
        }
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tid = toast.loading(project ? "Saving..." : "Creating...");

    try {
      const payload = {
        ...form,
        knowledge: {
          ...form.knowledge,
          services: typeof form.knowledge.services === 'string' 
            ? form.knowledge.services.split(",").map(s => s.trim()).filter(Boolean)
            : form.knowledge.services,
        },
      };

      if (project?._id) {
        await axios.put(`${API_BASE}/${project._id}`, payload);
        toast.success("Project updated", { id: tid });
      } else {
        await axios.post(`${API_BASE}/create`, payload);
        toast.success("Project created", { id: tid });
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving project", { id: tid });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Darker backdrop to distinguish from first modal */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-pop duration-300">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {project ? "Edit Project" : "New Project"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <HiXMark className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
          {/* Identity Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Project Name</label>
              <input 
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
              <select 
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white cursor-pointer"
                value={form.companyName}
                onChange={(e) => setForm({...form, companyName: e.target.value})}
              >
                <option value="" disabled>Select a company</option>
                <option value="affotax">Affotax</option>
                <option value="outsource">Outsource</option>
              </select>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest border-b pb-1">AI Personality</h4>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Response Tone</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-slate-50"
                value={form.aiConfig.tone}
                onChange={(e) => setForm({...form, aiConfig: {...form.aiConfig, tone: e.target.value}})}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="sales">Sales Focused</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Core Instructions</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                value={form.aiConfig.instructions}
                onChange={(e) => setForm({...form, aiConfig: {...form.aiConfig, instructions: e.target.value}})}
              />
            </div>

             <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Signature</label>
              <textarea 
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                value={form.aiConfig.signature}
                onChange={(e) => setForm({...form, aiConfig: {...form.aiConfig, signature: e.target.value}})}
              />
            </div>

          </div>

          {/* Knowledge Section */}
          {/* <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest border-b pb-1">Knowledge Core</h4>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Services (Comma Separated)</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                placeholder="SEO, Design, Hosting..."
                value={form.knowledge.services}
                onChange={(e) => setForm({...form, knowledge: {...form.knowledge, services: e.target.value}})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Pricing & FAQ</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                value={form.knowledge.faq}
                onChange={(e) => setForm({...form, knowledge: {...form.knowledge, faq: e.target.value}})}
              />
            </div>
          </div> */}

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100"
            >
              {project ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}