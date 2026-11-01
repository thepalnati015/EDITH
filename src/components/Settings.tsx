
import { useEffect, useState } from 'react';
import './Settings.css';

interface SettingsData {
  workspaceName: string;
  appearance: 'Dark' | 'Light';
  taskNotifications: boolean;
  complaintNotifications: boolean;
  defaultPriority: 'Low' | 'Medium' | 'High';
}

const STORAGE_KEY = 'edith_settings';

const defaultSettings: SettingsData = {
  workspaceName: 'EDITH Workspace',
  appearance: 'Dark',
  taskNotifications: true,
  complaintNotifications: true,
  defaultPriority: 'Medium',
};

function Settings() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const updateSetting = <K extends keyof SettingsData>(
    field: K,
    value: SettingsData[K]
  ) => {
    setSettings((previous) => {
      const updated = { ...previous, [field]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = settings.appearance.toLowerCase();
  }, [settings.appearance]);

  return (
    <div className="edith-settings-page">
      <div className="settings-heading">
        <div>
          <h2>Account Settings</h2>
          <p>Personalise your EDITH workspace and preferences.</p>
        </div>
      </div>

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">✧</span>
          <div>
            <h3>Workspace</h3>
            <p>Customise your workspace details.</p>
          </div>
        </div>

        <label className="settings-field">
          Workspace Name
          <input
            type="text"
            value={settings.workspaceName}
            onChange={(e) => updateSetting('workspaceName', e.target.value)}
            placeholder="Enter workspace name"
          />
        </label>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">◐</span>
          <div>
            <h3>Appearance</h3>
            <p>Choose how EDITH looks on your screen.</p>
          </div>
        </div>

        <div className="settings-choice-row">
          <span>Display Theme</span>
          <select
            value={settings.appearance}
            onChange={(e) =>
              updateSetting('appearance', e.target.value as 'Dark' | 'Light')
            }
          >
            <option value="Dark">Dark</option>
            <option value="Light">Light</option>
          </select>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">♧</span>
          <div>
            <h3>Notifications</h3>
            <p>Choose which updates you want to receive.</p>
          </div>
        </div>

        <div className="settings-toggle-row">
          <div>
            <strong>Task Reminders</strong>
            <p>Preferences for task-related updates.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.taskNotifications}
            onChange={(e) =>
              updateSetting('taskNotifications', e.target.checked)
            }
          />
        </div>

        <div className="settings-toggle-row">
          <div>
            <strong>Complaint Updates</strong>
            <p>Preferences for complaint-related updates.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.complaintNotifications}
            onChange={(e) =>
              updateSetting('complaintNotifications', e.target.checked)
            }
          />
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <span className="settings-icon">◇</span>
          <div>
            <h3>Task Preferences</h3>
            <p>Set your preferred default task priority.</p>
          </div>
        </div>

        <div className="settings-choice-row">
          <span>Default Task Priority</span>
          <select
            value={settings.defaultPriority}
            onChange={(e) =>
              updateSetting(
                'defaultPriority',
                e.target.value as 'Low' | 'Medium' | 'High'
              )
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </section>

      <p className="settings-saved-note">
        ✓ Your preferences are saved automatically on this device.
      </p>
    </div>
  );
}

export default Settings;
