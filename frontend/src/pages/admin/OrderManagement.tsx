import { useEffect, useState } from 'react';
import { FiEye, FiX } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import api from '@/services/api';
import { toast } from 'react-toastify';
import './Admin.scss';

interface OrderItem {
  id: number;
  order_number: string;
  user_name: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

interface OrderDetail {
  id: number;
  order_number: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  shipping_address: Record<string, string>;
  notes: string;
  items: { product_name: string; size_name: string; color_name: string; price: number; quantity: number; subtotal: number }[];
  created_at: string;
}

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchOrders = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getOrders(p);
      setOrders(res.data?.data || []);
      setTotalPages(res.data?.meta?.last_page || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const viewOrder = async (id: number) => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setDetail(res.data?.data);
      setShowDetail(true);
    } catch {
      toast.error('Failed to load order');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status);
      toast.success('Status updated');
      fetchOrders();
      if (detail?.id === id) setDetail({ ...detail!, status });
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'warning', confirmed: 'info', processing: 'info',
      shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'danger',
    };
    return map[status] || 'default';
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Orders</h1>
      </div>

      {loading ? (
        <div className="admin-page__loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{order.user_name || '—'}</td>
                  <td>₹{order.total.toLocaleString('en-IN')}</td>
                  <td>
                    <select
                      className={`admin-select admin-select--${statusColor(order.status)}`}
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="admin-table__action-btn" onClick={() => viewOrder(order.id)}>
                      <FiEye />
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

      {/* Order Detail Modal */}
      {showDetail && detail && (
        <div className="admin-modal">
          <div className="admin-modal__overlay" onClick={() => setShowDetail(false)} />
          <div className="admin-modal__content admin-modal__content--wide">
            <div className="admin-modal__header">
              <h2>Order {detail.order_number}</h2>
              <button className="admin-modal__close" onClick={() => setShowDetail(false)}><FiX /></button>
            </div>
            <div className="admin-order-detail">
              <div className="admin-order-detail__meta">
                <p><strong>Date:</strong> {new Date(detail.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`admin-badge admin-badge--${statusColor(detail.status)}`}>{detail.status}</span></p>
              </div>

              {detail.shipping_address && (
                <div className="admin-order-detail__address">
                  <h4>Shipping Address</h4>
                  <p>{detail.shipping_address.full_name}</p>
                  <p>{detail.shipping_address.address_line_1}</p>
                  {detail.shipping_address.address_line_2 && <p>{detail.shipping_address.address_line_2}</p>}
                  <p>{detail.shipping_address.city}, {detail.shipping_address.state} {detail.shipping_address.postal_code}</p>
                  <p>{detail.shipping_address.phone}</p>
                </div>
              )}

              <table className="admin-table">
                <thead>
                  <tr><th>Product</th><th>Size</th><th>Color</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  {detail.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td>{item.size_name}</td>
                      <td>{item.color_name}</td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-order-detail__totals">
                <p>Subtotal: ₹{detail.subtotal.toLocaleString('en-IN')}</p>
                <p>Shipping: ₹{detail.shipping.toLocaleString('en-IN')}</p>
                <p className="admin-order-detail__total">Total: ₹{detail.total.toLocaleString('en-IN')}</p>
              </div>

              {detail.notes && (
                <div className="admin-order-detail__notes">
                  <h4>Notes</h4>
                  <p>{detail.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
