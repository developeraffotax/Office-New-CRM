import Button from "../../shared/ui/Button.jsx";
import { PencilIcon, PlusIcon, TrashIcon } from "../../shared/ui/Icons.jsx";

export default function ProjectHeader({ project, onEdit, onDelete, onNewProduct }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{project.name}</h1>
        {project.description && <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">{project.description}</p>}
        <div className="mt-3 flex gap-1">
          <Button variant="ghost" size="sm" icon={<PencilIcon className="h-3.5 w-3.5" />} onClick={onEdit}>Rename or edit</Button>
          <Button variant="danger" size="sm" icon={<TrashIcon className="h-3.5 w-3.5" />} onClick={onDelete}>Delete project</Button>
        </div>
      </div>
      <Button icon={<PlusIcon />} onClick={onNewProduct}>New product</Button>
    </div>
  );
}
