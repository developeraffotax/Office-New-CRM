import UserSettings from "./UserSettings";
import AssignmentRules from "./AssignmentRules";

export default function SettingsPage() {
  return (
    <div className="w-full  font-google">
      {/* Page header */}
      <div className="px-6 py-4 ">
        <div className="flex items-center justify-between gap-4 px-6 py-5 bg-gray-50 rounded-xl border-l-[3px] border-orange-500">
          <div>
            <div className="font-mono text-xs text-gray-400 mb-1.5">
               / settings
            </div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">
             Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage preferences, notifications, and assignment rules.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px]  flex justify-start gap-8 p-6">
        <div className="w-full flex-1 max-w-4xl bg-white p-8 rounded-sm border border-gray-100 shadow-lg">
          <UserSettings />
        </div>

        <div className="w-full flex-1 max-w-4xl bg-white p-8 rounded-sm  border border-gray-100 shadow-lg">
          <AssignmentRules />
        </div>
      </div>
    </div>
  );
}
