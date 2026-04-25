import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create an Account</h2>
          <p>Join SkillIntern and start your journey</p>
        </div>

        <div className="role-cards">
          <div 
            className="role-card student-role"
            onClick={() => navigate('/register/student')}
          >
            <div className="role-icon">
              <FiUser />
            </div>
            <h3 className="role-title">Student</h3>
            <p className="role-description">Find internships and kickstart your career</p>
            <div className="role-arrow">
              <FiArrowRight />
            </div>
          </div>

          <div 
            className="role-card company-role"
            onClick={() => navigate('/register/company')}
          >
            <div className="role-icon">
              <FiBriefcase />
            </div>
            <h3 className="role-title">Company</h3>
            <p className="role-description">Post internships and hire talented students</p>
            <div className="role-arrow">
              <FiArrowRight />
            </div>
          </div>
        </div>

        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;