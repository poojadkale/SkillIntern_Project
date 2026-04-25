import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import companyService from '../../services/companyService';
import { 
  FiEdit2, FiSave, FiX, FiUpload, FiFile, FiDownload, 
  FiUser, FiMail, FiPhone, FiBook, FiGrid, FiCpu, 
  FiCalendar, FiAward, FiMapPin, FiBriefcase 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './StudentProfile.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    collegeName: '', 
    course: '', 
    branch: '', 
    yearOfStudy: '', 
    cgpa: '', 
    skills: '',
    phone: ''
  });

  useEffect(() => {
    if (user?.userId) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await companyService.getStudentProfile(user.userId);
      console.log('Profile data:', data);
      
      setProfile(data);
      setFormData({
        collegeName: data.collegeName || '',
        course: data.course || '',
        branch: data.branch || '',
        yearOfStudy: data.yearOfStudy || '',
        cgpa: data.cgpa || '',
        skills: data.skills || '',
        phone: data.phone || user?.phone || ''
      });
      
      if (data.resumeFilename) {
        setResumeName(data.resumeFilename);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF or Word document only');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setResumeName(file.name);
      toast.success('Resume selected: ' + file.name);
    }
  };

  const handleDownloadResume = () => {
    if (profile?.resumeFilename) {
      companyService.downloadResume(profile.resumeFilename);
    } else {
      toast.error('No resume uploaded');
    }
  };

  const validateForm = () => {
    if (!formData.collegeName.trim()) {
      toast.error('College name is required');
      return false;
    }
    if (!formData.course.trim()) {
      toast.error('Course is required');
      return false;
    }
    if (!formData.branch.trim()) {
      toast.error('Branch is required');
      return false;
    }
    if (!formData.yearOfStudy) {
      toast.error('Year of study is required');
      return false;
    }
    if (!formData.cgpa) {
      toast.error('CGPA is required');
      return false;
    }
    if (!formData.skills.trim()) {
      toast.error('Skills are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const submitData = {
        collegeName: formData.collegeName,
        course: formData.course,
        branch: formData.branch,
        yearOfStudy: parseInt(formData.yearOfStudy) || 1,
        cgpa: parseFloat(formData.cgpa) || 0,
        skills: formData.skills,
        phone: formData.phone
      };
      
      const updatedProfile = await companyService.updateStudentProfile(user.userId, submitData, resumeFile);
      
      console.log('Updated profile response:', updatedProfile);
      
      // Update the profile state with the new data
      setProfile({
        ...profile,
        ...updatedProfile,
        collegeName: updatedProfile.collegeName || formData.collegeName,
        course: updatedProfile.course || formData.course,
        branch: updatedProfile.branch || formData.branch,
        yearOfStudy: updatedProfile.yearOfStudy || parseInt(formData.yearOfStudy),
        cgpa: updatedProfile.cgpa || parseFloat(formData.cgpa),
        skills: updatedProfile.skills || formData.skills,
        phone: updatedProfile.phone || formData.phone,
        resumeFilename: updatedProfile.resumeFilename || profile?.resumeFilename
      });
      
      // Also update formData to match the new profile
      setFormData({
        collegeName: updatedProfile.collegeName || formData.collegeName,
        course: updatedProfile.course || formData.course,
        branch: updatedProfile.branch || formData.branch,
        yearOfStudy: updatedProfile.yearOfStudy || formData.yearOfStudy,
        cgpa: updatedProfile.cgpa || formData.cgpa,
        skills: updatedProfile.skills || formData.skills,
        phone: updatedProfile.phone || formData.phone
      });
      
      if (updatedProfile.resumeFilename) {
        setResumeName(updatedProfile.resumeFilename);
      }
      
      setIsEditing(false);
      setResumeFile(null);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      collegeName: profile?.collegeName || '',
      course: profile?.course || '',
      branch: profile?.branch || '',
      yearOfStudy: profile?.yearOfStudy || '',
      cgpa: profile?.cgpa || '',
      skills: profile?.skills || '',
      phone: profile?.phone || user?.phone || ''
    });
    setResumeFile(null);
    setResumeName(profile?.resumeFilename || '');
    setIsEditing(false);
  };

  const getYearSuffix = (year) => {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-left">
          <h1>Student Profile</h1>
          <p>Manage your academic information and resume</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label><FiUser /> Full Name</label>
                <input
                  type="text"
                  value={user?.fullName || ''}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label><FiMail /> Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label><FiPhone /> Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label><FiBook /> College Name *</label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="Enter your college name"
                />
              </div>

              <div className="form-group">
                <label><FiBook /> Course *</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech, MCA"
                />
              </div>

              <div className="form-group">
                <label><FiGrid /> Branch *</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label><FiCalendar /> Year of Study *</label>
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label><FiAward /> CGPA *</label>
                <input
                  type="number"
                  name="cgpa"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g., 8.5"
                />
              </div>

              <div className="form-group full-width">
                <label><FiCpu /> Skills *</label>
                <textarea
                  name="skills"
                  rows="3"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Java, Python, React, Communication (comma separated)"
                />
                <small>Separate skills with commas</small>
              </div>

              <div className="form-group full-width">
                <label><FiUpload /> Resume (Optional)</label>
                <div className="resume-upload">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="resume" className="upload-label">
                    <FiUpload /> {resumeName || 'Choose Resume (PDF/DOC)'}
                  </label>
                  {resumeName && (
                    <span className="file-name">{resumeName}</span>
                  )}
                  <small>Max size: 5MB. Formats: PDF, DOC, DOCX</small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-btn">
                <FiX /> Cancel
              </button>
              <button type="submit" disabled={saving} className="save-btn">
                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <div className="avatar-section">
              <div className="avatar">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="user-info">
                <h2>{user?.fullName}</h2>
                <p><FiMail /> {user?.email}</p>
                <p><FiPhone /> {profile?.phone || user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <label><FiBook /> College</label>
                <p>{profile?.collegeName || 'Not provided'}</p>
              </div>
              <div className="info-card">
                <label><FiBook /> Course</label>
                <p>{profile?.course || 'Not provided'}</p>
              </div>
              <div className="info-card">
                <label><FiGrid /> Branch</label>
                <p>{profile?.branch || 'Not provided'}</p>
              </div>
              <div className="info-card">
                <label><FiCalendar /> Year</label>
                <p>{profile?.yearOfStudy ? `${profile.yearOfStudy}${getYearSuffix(profile.yearOfStudy)} Year` : 'Not provided'}</p>
              </div>
              <div className="info-card">
                <label><FiAward /> CGPA</label>
                <p>{profile?.cgpa || 'Not provided'}</p>
              </div>
              <div className="info-card full-width">
                <label><FiCpu /> Skills</label>
                <div className="skills">
                  {profile?.skills?.split(',').map((skill, i) => (
                    <span key={i} className="skill">{skill.trim()}</span>
                  )) || 'No skills listed'}
                </div>
              </div>
              <div className="info-card full-width">
                <label><FiFile /> Resume</label>
                {profile?.resumeFilename ? (
                  <div className="resume-info">
                    <FiFile />
                    <span>{profile.resumeFilename}</span>
                    <button onClick={handleDownloadResume} className="download-btn">
                      <FiDownload /> Download
                    </button>
                  </div>
                ) : (
                  <p className="no-resume">No resume uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;