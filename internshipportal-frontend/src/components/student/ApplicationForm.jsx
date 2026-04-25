import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import companyService from '../../services/companyService';
import { 
  FiX, 
  FiSend, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBook, 
  FiGrid, 
  FiCpu,
  FiFile,
  FiUpload,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ApplicationForm.css';

const ApplicationForm = ({ internship, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    course: '',
    branch: '',
    yearOfStudy: '',
    cgpa: '',
    skills: '',
    coverLetter: '',
    whyHireYou: '',
    projects: '',
    achievements: ''
  });

  const [errors, setErrors] = useState({});

  // Helper function to get company name
  const getCompanyName = () => {
    if (!internship) return 'Company';
    
    // Check all possible locations for company name
    if (internship.companyName) return internship.companyName;
    if (internship.company?.name) return internship.company.name;
    if (internship.company?.companyName) return internship.company.companyName;
    if (internship.companyId && internship.companyDetails?.companyName) return internship.companyDetails.companyName;
    if (internship.employer?.name) return internship.employer.name;
    if (internship.employer?.companyName) return internship.employer.companyName;
    
    return 'Company';
  };

  // Load student profile data
  useEffect(() => {
    loadStudentProfile();
  }, [user]);

  const loadStudentProfile = async () => {
    try {
      const profile = await companyService.getStudentProfile(user.id);
      setFormData(prev => ({
        ...prev,
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        collegeName: profile?.collegeName || '',
        course: profile?.course || '',
        branch: profile?.branch || '',
        yearOfStudy: profile?.yearOfStudy || '',
        cgpa: profile?.cgpa || '',
        skills: profile?.skills || ''
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.course.trim()) newErrors.course = 'Course is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study is required';
    if (!formData.cgpa) newErrors.cgpa = 'CGPA is required';
    if (!formData.skills.trim()) newErrors.skills = 'Skills are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.whyHireYou.trim()) newErrors.whyHireYou = 'Please tell us why we should hire you';
    if (!resumeFile && !resumeName) newErrors.resume = 'Resume is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNext();
      return;
    }
    
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        yearOfStudy: parseInt(formData.yearOfStudy),
        cgpa: parseFloat(formData.cgpa)
      };

      await companyService.applyForInternship(internship.id, user.id, submitData, resumeFile);
      toast.success('Application submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your application progress will be lost.')) {
      onClose();
    }
  };

  if (!internship) return null;

  const companyName = getCompanyName();

  return (
    <div className="application-form-modal">
      <div className="application-form-content">
        <div className="form-header">
          <div>
            <h2>Apply for {internship.title}</h2>
            <div className="company-name">
              
              <span className="company-label">at</span>
              <span className="company-value">{companyName}</span>
            </div>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <FiX />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Personal & Academic</div>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Resume & Questions</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          {step === 1 && (
            <div className="form-step fade-in">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label><FiUser /> Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label><FiMail /> Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="Enter your email"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label><FiPhone /> Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Academic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label><FiBook /> College Name *</label>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className={errors.collegeName ? 'error' : ''}
                      placeholder="Enter your college name"
                    />
                    {errors.collegeName && <span className="error-message">{errors.collegeName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Course *</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className={errors.course ? 'error' : ''}
                      placeholder="e.g., B.Tech, MCA"
                    />
                    {errors.course && <span className="error-message">{errors.course}</span>}
                  </div>

                  <div className="form-group">
                    <label><FiGrid /> Branch *</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className={errors.branch ? 'error' : ''}
                      placeholder="e.g., Computer Science"
                    />
                    {errors.branch && <span className="error-message">{errors.branch}</span>}
                  </div>

                  <div className="form-group">
                    <label>Year of Study *</label>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className={errors.yearOfStudy ? 'error' : ''}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    {errors.yearOfStudy && <span className="error-message">{errors.yearOfStudy}</span>}
                  </div>

                  <div className="form-group">
                    <label>CGPA *</label>
                    <input
                      type="number"
                      name="cgpa"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={handleChange}
                      className={errors.cgpa ? 'error' : ''}
                      placeholder="8.5"
                    />
                    {errors.cgpa && <span className="error-message">{errors.cgpa}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label><FiCpu /> Skills *</label>
                    <textarea
                      name="skills"
                      rows="3"
                      value={formData.skills}
                      onChange={handleChange}
                      className={errors.skills ? 'error' : ''}
                      placeholder="List your skills (comma separated)"
                    />
                    {errors.skills && <span className="error-message">{errors.skills}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step fade-in">
              <div className="form-section">
                <h3>Resume Upload *</h3>
                <div className="resume-upload-area">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="resume" className="file-upload-label">
                    <FiUpload className="upload-icon" />
                    <span>{resumeName || 'Choose Resume (PDF/DOC)'}</span>
                  </label>
                  {errors.resume && <span className="error-message">{errors.resume}</span>}
                  {resumeName && (
                    <div className="file-info">
                      <FiFile /> {resumeName}
                    </div>
                  )}
                  <p className="file-hint">Max size: 5MB. Formats: PDF, DOC, DOCX</p>
                </div>
              </div>

              <div className="form-section">
                <h3>Application Questions</h3>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Why should we hire you? *</label>
                    <textarea
                      name="whyHireYou"
                      rows="4"
                      value={formData.whyHireYou}
                      onChange={handleChange}
                      className={errors.whyHireYou ? 'error' : ''}
                      placeholder="Explain why you're the best candidate for this internship..."
                    />
                    {errors.whyHireYou && <span className="error-message">{errors.whyHireYou}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label>Cover Letter (Optional)</label>
                    <textarea
                      name="coverLetter"
                      rows="4"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      placeholder="Write a brief cover letter introducing yourself..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Projects (Optional)</label>
                    <textarea
                      name="projects"
                      rows="3"
                      value={formData.projects}
                      onChange={handleChange}
                      placeholder="List your relevant projects..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Achievements (Optional)</label>
                    <textarea
                      name="achievements"
                      rows="3"
                      value={formData.achievements}
                      onChange={handleChange}
                      placeholder="Mention any awards or achievements..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            {step === 2 && (
              <button type="button" className="back-btn" onClick={handleBack}>
                <FiArrowLeft /> Back
              </button>
            )}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : step === 1 ? 'Next' : 'Submit Application'}
              {!loading && step === 2 && <FiSend />}
              {!loading && step === 1 && <FiArrowRight />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;