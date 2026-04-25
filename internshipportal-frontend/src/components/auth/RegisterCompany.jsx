import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiBriefcase, FiMail, FiLock, FiPhone, FiMapPin, FiGlobe, FiCheckCircle, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import './RegisterCompany.css';

const RegisterCompany = () => {
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
    role: 'COMPANY',
    companyName: '',
    website: '',
    location: '',
    description: '',
    gstNumber: '',
    registrationNumber: ''
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

  const validateGST = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validateRegistrationNumber = (regNo) => {
    const cinRegex = /^[U|L]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
    return cinRegex.test(regNo);
  };

  const validateWebsite = (website) => {
    if (!website) return true;
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(website);
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
    
    // Contact Person Validations
    if (!formData.fullName) {
      newErrors.fullName = 'Contact person name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
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
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number starting with 6,7,8,or 9';
    }
    
    // Company Details Validations
    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    // Verification Details Validations
    if (!formData.gstNumber) {
      newErrors.gstNumber = 'GST number is required';
    } else if (!validateGST(formData.gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Enter a valid GST number (Format: 22AAAAA0000A1Z5)';
    }
    
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Company registration number is required';
    } else if (!validateRegistrationNumber(formData.registrationNumber.toUpperCase())) {
      newErrors.registrationNumber = 'Enter a valid CIN (Format: U12345MH2020PTC123456)';
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
      // Format data before sending
      const submitData = {
        ...formData,
        gstNumber: formData.gstNumber.toUpperCase(),
        registrationNumber: formData.registrationNumber.toUpperCase(),
        website: formData.website || null
      };
      
      await register(submitData);
      alert('Registration successful! You can now login to your company dashboard.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-company">
      <div className="register-company-card">
        <button onClick={() => navigate('/register')} className="back-btn">
          <FiArrowLeft /> Back to Role Selection
        </button>
        
        <h2 className="register-company-title">Company Registration</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Contact Person Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiUser /> Contact Person Details
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter contact person's full name"
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
                  placeholder="company@example.com"
                />
                {errors.email && <span className="error">{errors.email}</span>}
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
          
          {/* Company Details Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiBriefcase /> Company Details
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your registered company name"
                />
                {errors.companyName && <span className="error">{errors.companyName}</span>}
              </div>
              
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                />
                {errors.website && <span className="error">{errors.website}</span>}
                <small>Optional but recommended for company credibility</small>
              </div>
              
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State, Country"
                />
                {errors.location && <span className="error">{errors.location}</span>}
              </div>
              
              <div className="form-group full-width">
                <label>Company Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your company, mission, values, and what you do..."
                />
                <small>This will help students learn more about your organization</small>
              </div>
            </div>
          </div>
          
          {/* Verification Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiCheckCircle /> Verification Details
            </h3>
            <div className="verification-note">
              <p>⚠️ Please provide accurate verification details. These will be verified by our admin team.</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>GST Number *</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  maxLength="15"
                />
                {errors.gstNumber && <span className="error">{errors.gstNumber}</span>}
                <small>15-character Goods and Services Tax Identification Number</small>
              </div>
              
              <div className="form-group">
                <label>Company Registration Number (CIN) *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g., U12345MH2020PTC123456"
                  maxLength="21"
                />
                {errors.registrationNumber && <span className="error">{errors.registrationNumber}</span>}
                <small>21-character Corporate Identification Number issued by MCA</small>
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
            {loading ? 'Registering...' : 'Register Company'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterCompany;