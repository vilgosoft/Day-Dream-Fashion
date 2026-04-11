import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import api from '@/services/api';
import './Admin.scss';

interface DashboardStats {
  total_products: number;
  total_users: number;
  total_orders: number;
  total_revenue: number;
  unread_messages: number;
  pending_orders: number;
  processing_orders: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data?.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-page"><div className="admin-page__loading">Loading dashboard...</div></div>;
  }

  const cards = [
    { label: 'Total Products', value: stats?.total_products || 0, icon: FiPackage, color: '#4f46e5', link: '/admin/products' },
    { label: 'Total Users', value: stats?.total_users || 0, icon: FiUsers, color: '#0891b2', link: '/admin/users' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: FiShoppingBag, color: '#e94560', link: '/admin/orders' },
    { label: 'Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: '#16a34a', link: '/admin/orders' },
    { label: 'Unread Messages', value: stats?.unread_messages || 0, icon: FiMessageSquare, color: '#f59e0b', link: '/admin/contacts' },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: FiShoppingBag, color: '#dc2626', link: '/admin/orders' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Dashboard</h1>
      </div>

      <div className="admin-dashboard__stats">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="admin-dashboard__stat-card">
            <div className="admin-dashboard__stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              <card.icon />
            </div>
            <div className="admin-dashboard__stat-info">
              <span className="admin-dashboard__stat-value">{card.value}</span>
              <span className="admin-dashboard__stat-label">{card.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
