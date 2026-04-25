import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './InternshipForm.css';

const InternshipForm = ({ internship, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    stipend: '',
    location: '',
    duration: '',
    type: 'Online',
    status: 'OPEN',
    endDate: '',
    numberOfOpenings: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (internship) {
      // Format dates properly for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // If it's already in YYYY-MM-DD format, return as is
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
        // Otherwise try to parse and format
        try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Date parsing error:', e);
        }
        return '';
      };

      setFormData({
        title: internship.title || '',
        description: internship.description || '',
        requiredSkills: internship.requiredSkills || '',
        stipend: internship.stipend || '',
        location: internship.location || '',
        duration: internship.duration || '',
        type: internship.type || 'Online',
        status: internship.status || 'OPEN',
        endDate: formatDateForInput(internship.endDate),
        numberOfOpenings: internship.numberOfOpenings || ''
      });
    }
  }, [internship]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requiredSkills.trim()) newErrors.requiredSkills = 'Required skills are required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    
    if (!formData.endDate) {
      newErrors.endDate = 'Application end date is required';
    } else {
      // Validate that end date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(formData.endDate);
      if (endDate < today) {
        newErrors.endDate = 'End date cannot be in the past';
      }
    }
    
    if (!formData.numberOfOpenings) {
      newErrors.numberOfOpenings = 'Number of openings is required';
    } else if (isNaN(formData.numberOfOpenings) || parseInt(formData.numberOfOpenings) <= 0) {
      newErrors.numberOfOpenings = 'Number of openings must be a positive number';
    }
    
    if (formData.stipend && isNaN(formData.stipend)) {
      newErrors.stipend = 'Stipend must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 Form submitted with data:', formData);
    
    if (validateForm()) {
      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requiredSkills: formData.requiredSkills.trim(),
        stipend: formData.stipend ? parseFloat(formData.stipend) : 0,
        location: formData.location.trim(),
        duration: formData.duration.trim(),
        type: formData.type,
        status: formData.status,
        // Send date in YYYY-MM-DD format (already in correct format from date input)
        endDate: formData.endDate,
        numberOfOpenings: formData.numberOfOpenings ? parseInt(formData.numberOfOpenings) : 1
      };
      
      console.log('🚀 Submitting data to parent:', submitData);
      console.log('🚀 Internship ID:', internship?.id);
      
      // Call onSubmit with the data
      onSubmit(internship?.id, submitData);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="internship-form-container" style={{ position: 'relative' }}>
      {/* Close Button - Modern & Stylish */}
      <button 
        type="button" 
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          fontSize: '18px',
          fontWeight: '500',
          zIndex: 10,
          padding: 0,
          lineHeight: 1,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.borderColor = '#ef4444';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }}
      >
        ✕
      </button>

      <div className="form-header">
        <h2 className="form-title">
          {internship ? 'Edit Internship' : 'Post New Internship'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="internship-form">
        <div className="form-group">
          <label>Internship Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            placeholder="e.g., Frontend Developer Intern"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            placeholder="Describe the internship role, responsibilities, etc."
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>Required Skills *</label>
          <textarea
            name="requiredSkills"
            rows="3"
            value={formData.requiredSkills}
            onChange={handleChange}
            className={errors.requiredSkills ? 'error' : ''}
            placeholder="e.g., Java, Spring Boot, React, MySQL (comma separated)"
          />
          {errors.requiredSkills && <span className="error-message">{errors.requiredSkills}</span>}
        </div>

        {/* Row for Date and Openings */}
        <div className="form-row">
          <div className="form-group">
            <label>Application End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={today}
              className={errors.endDate ? 'error' : ''}
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>

          <div className="form-group">
            <label>Number of Openings *</label>
            <input
              type="number"
              name="numberOfOpenings"
              value={formData.numberOfOpenings}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 5"
              className={errors.numberOfOpenings ? 'error' : ''}
            />
            {errors.numberOfOpenings && <span className="error-message">{errors.numberOfOpenings}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stipend (per month)</label>
            <input
              type="number"
              name="stipend"
              value={formData.stipend}
              onChange={handleChange}
              className={errors.stipend ? 'error' : ''}
              placeholder="e.g., 25000"
            />
            {errors.stipend && <span className="error-message">{errors.stipend}</span>}
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
              placeholder="e.g., Bangalore, Remote"
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label>Duration *</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={errors.duration ? 'error' : ''}
              placeholder="e.g., 3 months"
            />
            {errors.duration && <span className="error-message">{errors.duration}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Work Type *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Online">Online</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {internship ? 'Update Internship' : 'Post Internship'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternshipForm;