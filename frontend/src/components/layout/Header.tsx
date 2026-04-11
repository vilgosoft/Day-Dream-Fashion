import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import './Header.scss';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { totalItems } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-text">Day Dream</span>
          <span className="header__logo-accent">Fashion</span>
        </Link>

        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
          <Link to="/" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link to="/contact" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </nav>

        <div className="header__actions">
          <Link to="/wishlist" className="header__action-btn" title="Wishlist">
            <FiHeart />
          </Link>

          <Link to="/cart" className="header__action-btn header__cart-btn" title="Cart">
            <FiShoppingCart />
            {totalItems > 0 && (
              <span className="header__cart-badge">{totalItems}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="header__user-menu">
              <button className="header__action-btn header__user-btn">
                <FiUser />
                <span className="header__user-name">{user?.name?.split(' ')[0]}</span>
              </button>
              <div className="header__dropdown">
                <Link to="/orders" className="header__dropdown-item">My Orders</Link>
                <Link to="/wishlist" className="header__dropdown-item">Wishlist</Link>
                <button onClick={handleLogout} className="header__dropdown-item header__dropdown-item--logout">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="header__action-btn" title="Login">
              <FiUser />
            </Link>
          )}

          <button
            className="header__mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
