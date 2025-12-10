import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
 
import toast from "react-hot-toast";
import { getUserSettings, updateUserSettings } from "../../redux/slices/settingsSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.auth.user?.id);
  const { settings, isLoading } = useSelector((state) => state.settings);

  const [localSettings, setLocalSettings] = useState({
    theme: "light",
    showSidebar: true,
    showNotifications: true,
  });

  // Load settings
  useEffect(() => {
    if (userId) dispatch(getUserSettings(userId));
  }, [userId, dispatch]);

  // Sync after load
  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    dispatch(updateUserSettings(localSettings))
      .unwrap()
      .then(() => toast.success("Settings saved"))
      .catch(() => toast.error("Failed to save settings"));
  };

  const toggle = (key) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full ">
        <div className="w-full max-w-2xl bg-white p-8 ">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">User Settings</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading settings...</p>
      ) : (
        <>
          {/* Theme */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Theme</label>

            <select
              value={localSettings.theme}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, theme: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <ToggleRow
            label="Show Sidebar"
            enabled={localSettings.showSidebar}
            onChange={() => toggle("showSidebar")}
          />

          <ToggleRow
            label="Enable Notifications"
            enabled={localSettings.showNotifications}
            onChange={() => toggle("showNotifications")}
          />

           <button
            onClick={handleSave}
            className="  w-full mt-8  bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition max-w-[200px]"
          >
            Save Settings
          </button>
        </>
      )}
    </div>
     

    </div>
  );
}

// ----------------------------------------------------
// Tailwind Toggle Component (NO HEADLESS UI)
// ----------------------------------------------------
function ToggleRow({ label, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <span className="text-gray-700 font-medium">{label}</span>

      <button
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${enabled ? "bg-orange-600" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${enabled ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
