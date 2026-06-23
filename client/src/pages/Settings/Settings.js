import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getUserSettings, updateUserSettings } from "../../redux/slices/settingsSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.auth.user?.id);
  const { settings, isLoading } = useSelector((state) => state.settings);
  const navigate = useNavigate();

  const [localSettings, setLocalSettings] = useState({
    theme: "light",
    showSidebar: true,
    showCrmNotifications: true,
    showEmailNotifications: true,
    showWhatsappNotifications: true,
    inboxConfig: {
      inboxUnreadCount: true,
      sidebarUnreadCount: true,
      showUnreadCountFor: "all",
    },
  });

  useEffect(() => {
    if (userId) dispatch(getUserSettings(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme: settings.theme ?? "light",
        showSidebar: settings.showSidebar ?? true,
        showCrmNotifications: settings.showCrmNotifications ?? true,
        showEmailNotifications: settings.showEmailNotifications ?? true,
        showWhatsappNotifications: settings.showWhatsappNotifications ?? true,
        inboxConfig: {
          inboxUnreadCount: settings.inboxConfig?.inboxUnreadCount ?? true,
          sidebarUnreadCount: settings.inboxConfig?.sidebarUnreadCount ?? true,
          showUnreadCountFor: settings.inboxConfig?.showUnreadCountFor ?? "all",
        },
      });
    }
  }, [settings]);

  const toggle = (key) =>
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleInbox = (key) =>
    setLocalSettings((prev) => ({
      ...prev,
      inboxConfig: { ...prev.inboxConfig, [key]: !prev.inboxConfig[key] },
    }));

  const setInboxFilter = (value) =>
    setLocalSettings((prev) => ({
      ...prev,
      inboxConfig: { ...prev.inboxConfig, showUnreadCountFor: value },
    }));

  const handleSave = () => {
    dispatch(updateUserSettings(localSettings))
      .unwrap()
      .then(() => toast.success("Settings saved"))
      .catch(() => toast.error("Failed to save settings"));
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-2xl bg-white p-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">User Settings</h1>

        {isLoading ? (
          <p className="text-gray-500">Loading settings...</p>
        ) : (
          <>
            {/* Theme */}
            <div className="mb-8">
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

            {/* Layout */}
            <ToggleRow
              label="Show Sidebar"
              enabled={localSettings.showSidebar}
              onChange={() => toggle("showSidebar")}
            />

            {/* Notifications */}
            <Section title="Notifications">
              <ToggleRow
                label="CRM Notifications"
                enabled={localSettings.showCrmNotifications}
                onChange={() => toggle("showCrmNotifications")}
              />
              <ToggleRow
                label="Email Notifications"
                enabled={localSettings.showEmailNotifications}
                onChange={() => toggle("showEmailNotifications")}
              />

               <ToggleRow
                label="Whatsapp Notifications"
                enabled={localSettings.showWhatsappNotifications}
                onChange={() => toggle("showWhatsappNotifications")}
              />


              <button
                onClick={() => navigate("/settings/signatures")}
                className="text-orange-500 font-medium py-2 rounded-lg transition max-w-[200px]"
              >
                Manage Signatures
              </button>
            </Section>

            {/* Inbox Config */}
            <Section title="Inbox">
              <ToggleRow
                label="Show Unread Count in Inbox"
                enabled={localSettings.inboxConfig.inboxUnreadCount}
                onChange={() => toggleInbox("inboxUnreadCount")}
              />
              <ToggleRow
                label="Show Unread Count in Sidebar"
                enabled={localSettings.inboxConfig.sidebarUnreadCount}
                onChange={() => toggleInbox("sidebarUnreadCount")}
              />

              {/* showUnreadCountFor — only relevant when at least one count is enabled */}
              {(localSettings.inboxConfig.inboxUnreadCount ||
                localSettings.inboxConfig.sidebarUnreadCount) && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Show Unread Count For
                  </label>
                  <div className="flex gap-3">
                    {["all", "unassigned"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setInboxFilter(option)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition
                          ${
                            localSettings.inboxConfig.showUnreadCountFor === option
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <button
              onClick={handleSave}
              className="w-full mt-10 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition max-w-[200px]"
            >
              Save Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

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