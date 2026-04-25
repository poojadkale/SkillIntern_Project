import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMail, 
  FiPhone, 
  FiSend, 
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiMapPin,
  FiGlobe
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './ContactUs.css';

const ContactUs = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    subject: '',
    message: '',
    userId: user?.id || null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    if (formData.message.length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare payload
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: formData.userId
      };
      
      console.log('📤 Sending payload:', payload);
      
      const response = await api.post('/contact/submit', payload);
      
      console.log('📥 Response:', response.data);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setIsSubmitted(true);
        
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: user?.fullName || '',
            email: user?.email || '',
            subject: '',
            message: '',
            userId: user?.id || null
          });
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        toast.error(firstError || 'Please check your form fields');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of your component remains the same...
  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </div>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FiMail />
            </div>
            <h3>Email Us</h3>
            <p>support@skillintern.com</p>
            <p>careers@skillintern.com</p>
            <span className="contact-info-response">Response within 24h</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FiPhone />
            </div>
            <h3>Call Us</h3>
            <p>+91 98765 43210</p>
            <p>+91 12345 67890</p>
            <span className="contact-info-response">Mon-Fri, 9am-6pm</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FiMapPin />
            </div>
            <h3>Visit Us</h3>
            <p>Bangalore, India</p>
            <p>Tech Hub, Silicon Valley</p>
            <span className="contact-info-response">By appointment only</span>
          </div>
        </div>

        {/* Contact Form and Business Hours Section */}
        <div className="contact-main-section">
          {/* Contact Form */}
          <div className="contact-form-container">
            <div className="contact-form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you shortly</p>
            </div>

            {isSubmitted ? (
              <div className="contact-success-message">
                <FiCheckCircle className="success-icon" />
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <FiUser /> Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <FiMail /> Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    <FiMessageSquare /> Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <FiMessageSquare /> Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us how we can help you..."
                    disabled={isSubmitting}
                  ></textarea>
                  <small className="char-count">
                    {formData.message.length}/2000 characters
                  </small>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <FiSend /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Business Hours & Quick Info */}
          <div className="contact-sidebar">
            <div className="business-hours">
              <h3>
                <FiClock /> Business Hours
              </h3>
              <div className="hours-list">
                <div className="hours-item">
                  <span>Monday - Friday:</span>
                  <strong>9:00 AM - 6:00 PM</strong>
                </div>
                <div className="hours-item">
                  <span>Saturday:</span>
                  <strong>10:00 AM - 4:00 PM</strong>
                </div>
                <div className="hours-item">
                  <span>Sunday:</span>
                  <strong className="closed">Closed</strong>
                </div>
              </div>
            </div>

            <div className="quick-faq">
              <h3>Quick Answers</h3>
              <div className="faq-item">
                <h4>How do I apply for internships?</h4>
                <p>Create a student account, browse internships, and click "Apply Now".</p>
              </div>
              <div className="faq-item">
                <h4>How do I post internships?</h4>
                <p>Register as a company, complete your profile, and post internships.</p>
              </div>
              <div className="faq-item">
                <h4>Is SkillIntern free?</h4>
                <p>Yes! Both students and companies can use SkillIntern for free.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;