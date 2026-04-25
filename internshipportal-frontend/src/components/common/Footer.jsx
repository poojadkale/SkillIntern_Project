import React from 'react';
import { FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="simple-footer">
      <div className="simple-footer-container">
        <p>
          &copy; {currentYear} SkillIntern. All rights reserved. 
        
        </p>
      </div>
    </footer>
  );
};

export default Footer;