import Avatar from "../../shared/ui/Avatar.jsx";
import Button from "../../shared/ui/Button.jsx";
import { PlusIcon } from "../../shared/ui/Icons.jsx";

// Shown when there are no projects yet.
export default function KnowledgeEmpty({ onCreate }) {
  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center text-center">
      <Avatar size="h-12 w-12" iconSize="h-6 w-6" />
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gray-900">Teach the assistant about your work</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Create a project like Accounting, add products such as Payroll, then attach a description and documents. Employees can ask the assistant about anything you add here.
      </p>
      <Button className="mt-6" icon={<PlusIcon />} onClick={onCreate}>
        Create your first project
      </Button>
    </div>
  );
}
