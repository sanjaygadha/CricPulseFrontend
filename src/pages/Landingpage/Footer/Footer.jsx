import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';

import './Footer.css'; // Import the CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Follow Us Section */}
        <div className="follow-us">
          <p>For latest news and updates please follow us on</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="footer-links">
          <Link to="/">
          <a href="#">About</a>
          </Link>
          <Link to='/'>
          <a href="#">Jobs</a>
          </Link>
          <Link to='/'>
          <a href="#">Privacy Policy</a>
          </Link>
          <Link to='/'>
          <a href="#">Terms of Service</a>
          </Link>
          <Link to='/'>
          <a href="#">Paid Service Terms</a>
          </Link>
          <Link to='/'>
          <a href="#">ICC Policy</a>
          </Link>
        </div>

        {/* Copyright Section */}
        <div className="copyright">
          <p>© CricPulse Pvt Ltd. All rights reserved. CIN U932587415389625</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;