import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';
import './Admin.scss';

interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(p);
      setUsers(res.data?.data || []);
      setTotalPages(res.data?.meta?.last_page || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const toggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Users</h1>
      </div>

      {loading ? (
        <div className="admin-page__loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${user.status === 'active' ? 'success' : 'danger'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`admin-table__status-btn ${user.status === 'active' ? 'admin-table__status-btn--block' : 'admin-table__status-btn--activate'}`}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Block' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="admin-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`admin-pagination__btn ${p === page ? 'admin-pagination__btn--active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
