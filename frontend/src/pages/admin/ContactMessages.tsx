import { useEffect, useState } from 'react';
import { FiMail, FiEye, FiX } from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'react-toastify';
import './Admin.scss';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contacts', { params: { page: p } });
      setMessages(res.data?.data || []);
      setTotalPages(res.data?.meta?.last_page || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, [page]);

  const viewMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await api.put(`/admin/contacts/${msg.id}/read`);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch { /* ignore */ }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Messages</h1>
      </div>

      {loading ? (
        <div className="admin-page__loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>From</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} style={{ fontWeight: msg.is_read ? 'normal' : 600 }}>
                  <td>
                    {msg.is_read ? (
                      <FiMail style={{ color: '#adb5bd' }} />
                    ) : (
                      <FiMail style={{ color: '#e94560' }} />
                    )}
                  </td>
                  <td>
                    <div><strong>{msg.name}</strong></div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{msg.email}</div>
                  </td>
                  <td>{msg.subject}</td>
                  <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="admin-table__action-btn" onClick={() => viewMessage(msg)}>
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="admin-modal">
          <div className="admin-modal__overlay" onClick={() => setSelectedMessage(null)} />
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{selectedMessage.subject}</h2>
              <button className="admin-modal__close" onClick={() => setSelectedMessage(null)}><FiX /></button>
            </div>
            <div className="admin-order-detail">
              <div className="admin-order-detail__meta">
                <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div className="admin-order-detail__notes">
                <p>{selectedMessage.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
