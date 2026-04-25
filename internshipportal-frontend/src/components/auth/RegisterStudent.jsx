import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiUser, FiMail, FiLock, FiPhone, FiBook, FiBriefcase, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import './RegisterStudent.css';

const RegisterStudent = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'STUDENT',
    collegeName: '',
    course: '',
    branch: '',
    yearOfStudy: '',
    cgpa: '',
    skills: '',
    collegeIdNumber: ''
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateCGPA = (cgpa) => {
    const cgpaNum = parseFloat(cgpa);
    return !isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 10;
  };

  const validateYearOfStudy = (year) => {
    return year >= 1 && year <= 4;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Personal Information Validations
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = 'Name must not exceed 50 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number starting with 6,7,8, or 9';
    }
    
    // Education Details Validations
    if (!formData.collegeName) {
      newErrors.collegeName = 'College name is required';
    } else if (formData.collegeName.length < 2) {
      newErrors.collegeName = 'College name must be at least 2 characters';
    }
    
    if (!formData.course) {
      newErrors.course = 'Course is required';
    } else if (formData.course.length < 2) {
      newErrors.course = 'Please enter a valid course name';
    }
    
    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    } else if (formData.branch.length < 2) {
      newErrors.branch = 'Please enter a valid branch name';
    }
    
    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Year of study is required';
    } else if (!validateYearOfStudy(parseInt(formData.yearOfStudy))) {
      newErrors.yearOfStudy = 'Please select a valid year (1-4)';
    }
    
    if (!formData.cgpa) {
      newErrors.cgpa = 'CGPA is required';
    } else if (!validateCGPA(formData.cgpa)) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }
    
    // Skills validation (optional but with format check)
    if (formData.skills && formData.skills.length > 0) {
      const skillsArray = formData.skills.split(',').map(s => s.trim());
      if (skillsArray.some(skill => skill.length > 30)) {
        newErrors.skills = 'Each skill should not exceed 30 characters';
      }
    }
    
    // Verification Details Validations
    if (!formData.collegeIdNumber) {
      newErrors.collegeIdNumber = 'College ID number is required';
    } else if (formData.collegeIdNumber.length < 5) {
      newErrors.collegeIdNumber = 'College ID number must be at least 5 characters';
    } else if (formData.collegeIdNumber.length > 20) {
      newErrors.collegeIdNumber = 'College ID number must not exceed 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);
      console.log('Registration response:', response);
      alert('Registration successful! You can now login to your student dashboard.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-student">
      <div className="register-student-card">
        <button onClick={() => navigate('/register')} className="back-btn">
          <FiArrowLeft /> Back to Role Selection
        </button>
        
        <h2 className="register-student-title">Student Registration</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiUser /> Personal Information
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error">{errors.email}</span>}
                <small>We'll send verification and updates to this email</small>
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
                <small>Enter a valid 10-digit mobile number starting with 6,7,8, or 9</small>
              </div>
              
              <div className="form-group password-field">
                <label>Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error">{errors.password}</span>}
                <small>Must contain uppercase, lowercase, number and special character</small>
              </div>
              
              <div className="form-group password-field">
                <label>Confirm Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>
          
          {/* Education Details Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiBook /> Education Details
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>College / University Name *</label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="Enter your college or university name"
                />
                {errors.collegeName && <span className="error">{errors.collegeName}</span>}
              </div>
              
              <div className="form-group">
                <label>Course / Degree *</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech, BCA, MCA, MBA"
                />
                {errors.course && <span className="error">{errors.course}</span>}
              </div>
              
              <div className="form-group">
                <label>Branch / Specialization *</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Information Technology"
                />
                {errors.branch && <span className="error">{errors.branch}</span>}
              </div>
              
              <div className="form-group">
                <label>Year of Study *</label>
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
                {errors.yearOfStudy && <span className="error">{errors.yearOfStudy}</span>}
              </div>
              
              <div className="form-group">
                <label>CGPA / Percentage *</label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g., 8.5 (out of 10)"
                />
                {errors.cgpa && <span className="error">{errors.cgpa}</span>}
                <small>Enter CGPA on a scale of 0-10</small>
              </div>
              
              <div className="form-group full-width">
                <label>Technical Skills</label>
                <textarea
                  name="skills"
                  rows="3"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., Java, Python, React, JavaScript, SQL (separate with commas)"
                />
                {errors.skills && <span className="error">{errors.skills}</span>}
                <small>List your technical skills separated by commas</small>
              </div>
            </div>
          </div>
          
          {/* Verification Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiCheckCircle /> Verification Details
            </h3>
            <div className="verification-note">
              <p>⚠️ Please provide your valid college ID number. This will be used for student verification.</p>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>College ID Number *</label>
                <input
                  type="text"
                  name="collegeIdNumber"
                  value={formData.collegeIdNumber}
                  onChange={handleChange}
                  placeholder="Enter your college ID card number"
                />
                {errors.collegeIdNumber && <span className="error">{errors.collegeIdNumber}</span>}
                <small>This will be verified by our admin team</small>
              </div>
            </div>
          </div>
          
          <div className="terms-agreement">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and 
              confirm that all information provided is accurate
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;