import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import companyService from '../../services/companyService';
import { 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiGlobe, 
  FiMapPin, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBriefcase,
  FiCamera
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    location: '',
    description: ''
  });
  
  // State for user editable fields - now includes fullName and email
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanyProfile(user.id);
      setProfile(data);
      setFormData({
        companyName: data.companyName || '',
        website: data.website || '',
        location: data.location || '',
        description: data.description || ''
      });
      setUserFormData({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || data.phone || ''  // Get phone from user object first
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update company profile
      const updatedProfile = await companyService.updateCompanyProfile(user.id, {
        companyName: formData.companyName,
        website: formData.website,
        location: formData.location,
        description: formData.description
      });
      
      setProfile(updatedProfile);
      
      // Update user information (fullName, email, phone)
      const updatedUserData = {
        fullName: userFormData.fullName,
        email: userFormData.email,
        phone: userFormData.phone
      };
      
      // Call API to update user
      await companyService.updateUserProfile(user.id, updatedUserData);
      
      // Update user context
      if (updateUser) {
        await updateUser({ ...user, ...updatedUserData });
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: profile?.companyName || '',
      website: profile?.website || '',
      location: profile?.location || '',
      description: profile?.description || ''
    });
    setUserFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="company-profile-page">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h1 className="profile-title">Company Profile</h1>
          <p className="profile-subtitle">Manage your company information</p>
        </div>
        {!isEditing && (
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Company Logo/Icon Section */}
        <div className="profile-sidebar">
          <div className="company-logo-large">
            {profile?.companyName ? (
              <span>{getInitials(profile.companyName)}</span>
            ) : (
              <FiBriefcase />
            )}
          </div>
          <div className="company-name-large">
            {profile?.companyName || 'Your Company'}
          </div>
          <div className="company-meta">
            <div className="meta-item">
              <FiMail className="meta-icon" />
              <span>{user?.email || 'Not added'}</span>
            </div>
            <div className="meta-item">
              <FiPhone className="meta-icon" />
              <span>{user?.phone || profile?.phone || 'Not added'}</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="profile-main">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3 className="section-title">Company Information</h3>
                
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      <FiBriefcase className="field-icon" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <FiGlobe className="field-icon" />
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <FiMapPin className="field-icon" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>
                
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      <FiUser className="field-icon" />
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={userFormData.fullName}
                      onChange={handleUserChange}
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <FiMail className="field-icon" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleUserChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <FiPhone className="field-icon" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userFormData.phone}
                      onChange={handleUserChange}
                      placeholder="+91 1234567890"
                    />
                    <small className="field-hint">Contact number for students to reach you</small>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">About Company</h3>
                <div className="form-field full-width">
                  <textarea
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your company, mission, culture, etc."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel} disabled={saving}>
                  <FiX /> Cancel
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view">
              <div className="info-section">
                <h3 className="info-title">Company Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Company Name</span>
                    <span className="info-value">{profile?.companyName || 'Not added'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Website</span>
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="info-link">
                        {profile.website}
                      </a>
                    ) : (
                      <span className="info-value">Not added</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{profile?.location || 'Not added'}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3 className="info-title">Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Contact Person</span>
                    <span className="info-value">{user?.fullName || 'Not added'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email || 'Not added'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{user?.phone || 'Not added'}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3 className="info-title">About Company</h3>
                <div className="info-description">
                  {profile?.description || 'No description added yet.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;