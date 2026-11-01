
import { useState } from 'react';
import './MyProfile.css';

interface Profile {
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
}

const STORAGE_KEY = 'edith_profile';

const defaultProfile: Profile = {
  name: '',
  email: '',
  role: '',
  phone: '',
  department: '',
};

function MyProfile() {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSavedMessage('');
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSavedMessage('Profile updated successfully!');
  };

  const initials = profile.name.trim()
    ? profile.name.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
    : 'ED';

  return (
    <div className="edith-profile-page">
      <div className="profile-heading">
        <div>
          <h2>My Profile</h2>
          <p>Manage your personal information and profile details.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-banner" />

        <div className="profile-identity">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h3>{profile.name || 'Your Name'}</h3>
            <p>{profile.role || 'Your Role'}</p>
          </div>
        </div>

        <div className="profile-form">
          <div className="profile-section-title">
            <h3>Personal Information</h3>
            <p>Update the information associated with your EDITH profile.</p>
          </div>

          <div className="profile-fields">
            <label>
              Full Name
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email address"
              />
            </label>

            <label>
              Job Title
              <input
                type="text"
                value={profile.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="e.g. Operations Associate"
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </label>

            <label className="profile-full-width">
              Department
              <input
                type="text"
                value={profile.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g. Customer Operations"
              />
            </label>
          </div>

          <div className="profile-actions">
            <span className="profile-save-message">{savedMessage}</span>
            <button className="profile-save-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
