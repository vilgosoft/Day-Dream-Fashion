import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand">
            <h3 className="footer__logo">
              <span>Day Dream</span> <em>Fashion</em>
            </h3>
            <p className="footer__tagline">
              Elevate your style with our curated collection of premium clothing.
              Fashion that makes you feel extraordinary.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" className="footer__social-link" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className="footer__social-link" aria-label="Facebook"><FiFacebook /></a>
            </div>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Quick Links</h4>
            <Link to="/" className="footer__link">Home</Link>
            <Link to="/shop" className="footer__link">Shop</Link>
            <Link to="/contact" className="footer__link">Contact Us</Link>
            <Link to="/login" className="footer__link">My Account</Link>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Categories</h4>
            <Link to="/shop?category=men" className="footer__link">Men</Link>
            <Link to="/shop?category=women" className="footer__link">Women</Link>
            <Link to="/shop?category=kids" className="footer__link">Kids</Link>
            <Link to="/shop?category=accessories" className="footer__link">Accessories</Link>
          </div>

          <div className="footer__contact">
            <h4 className="footer__heading">Contact</h4>
            <div className="footer__contact-item">
              <FiMapPin />
              <span>123 Fashion Street, Mumbai, India</span>
            </div>
            <div className="footer__contact-item">
              <FiPhone />
              <span>+91-XXXXXXXXXX</span>
            </div>
            <div className="footer__contact-item">
              <FiMail />
              <span>info@daydreamfashion.com</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Day Dream Fashion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
