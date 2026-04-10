import { Routes, Route } from 'react-router-dom';

// Pages — will be implemented in subsequent steps
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import InventoryManagement from './pages/admin/InventoryManagement';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/inventory" element={<InventoryManagement />} />
    </Routes>
  );
}
