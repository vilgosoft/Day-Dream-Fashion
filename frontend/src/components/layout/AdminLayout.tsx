import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiGrid, FiPackage, FiLayers, FiUsers, FiShoppingBag, FiDatabase, FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { adminLogout } from '@/store/slices/adminSlice';
import './AdminLayout.scss';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/categories', label: 'Categories', icon: FiLayers },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/admin/users', label: 'Users', icon: FiUsers },
  { path: '/admin/inventory', label: 'Inventory', icon: FiDatabase },
  { path: '/admin/contacts', label: 'Messages', icon: FiMessageSquare },
];

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <Link to="/admin/dashboard">
            <span>DDF</span> Admin
          </Link>
        </div>
        <nav className="admin-layout__nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`admin-layout__nav-link ${location.pathname === path ? 'admin-layout__nav-link--active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button className="admin-layout__logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
