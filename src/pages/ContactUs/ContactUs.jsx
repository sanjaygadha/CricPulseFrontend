import './Contsctus.css'; // Import the CSS file for styling
import { PhoneOutlined, MailOutlined } from "@ant-design/icons";

const ContactUs = () => {
  return (
    <div className="contact-us">
      <div className="header-contact">
        <div className="header-content">
          <h1>Contact Us</h1>
          <p className="intro">Need help? Tell us more and we’ll be happy to assist you.</p>
        </div>
      </div>

      <div className="content">
        {/* Contact Sections Container */}
        <div className="contact-sections-container">
          {/* Association Section */}
          <div className="contact-section">
            <h2>Association</h2>
            <p>For partnering with us</p>
            <div className="contact-info">
              <p>
                <MailOutlined /> partnerships@cricpulse.in
              </p>
              <p>
                <PhoneOutlined /> +91 7816816001
              </p>
            </div>
            <button className="cta-button">BOOK DEMO</button>
          </div>

          {/* Support Section */}
          <div className="contact-section">
            <h2>Support</h2>
            <p>For player queries</p>
            <div className="contact-info">
              <p>
                <MailOutlined /> support@cricpulse.in
              </p>
              <p>
                <PhoneOutlined /> +91 8141665555
              </p>
            </div>
            <button className="cta-button">WHATSAPP</button>
          </div>

          {/* Power Promote Section */}
          <div className="contact-section">
            <h2>Power Promote</h2>
            <p>The most powerful way to promote your Cricket Tournament or Brand.</p>
            <div className="contact-info">
              <p>
                <MailOutlined /> sales@cricpulse.in
              </p>
            </div>
            <button className="cta-button">WHATSAPP</button>
          </div>
        </div>

        {/* Grow With Us Section */}
        <div className="grow-with-us">
          <h2>We want you to Grow With Us!</h2>
          <p>
            At CricPulse, we are building a culture where passionate people [like you] can grow.
          </p>
          <button className="cta-button">SEE ALL OPEN POSITION</button>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>
            Suite 301, Pinnacle Towers, Beside Novotel, Hitech City Road, Madhapur, Hyderabad, Telangana - 500081.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;