import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';
import './Admin.scss';

interface InventoryItem {
  id: number;
  product_name: string;
  size_name: string;
  color_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  status: string;
}

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editingStock, setEditingStock] = useState<Record<number, number>>({});

  const fetchInventory = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getInventory(p);
      setInventory(res.data?.data || []);
      setTotalPages(res.data?.meta?.last_page || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, [page]);

  const handleStockChange = (id: number, value: string) => {
    setEditingStock({ ...editingStock, [id]: parseInt(value) || 0 });
  };

  const saveStock = async (item: InventoryItem) => {
    const newQty = editingStock[item.id];
    if (newQty === undefined || newQty === item.stock_quantity) return;
    try {
      await adminService.updateStock(item.id, newQty);
      toast.success(`Stock updated for ${item.sku}`);
      setEditingStock((prev) => { const copy = { ...prev }; delete copy[item.id]; return copy; });
      fetchInventory();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const stockLevel = (qty: number) => {
    if (qty === 0) return 'out';
    if (qty <= 5) return 'low';
    return 'ok';
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Inventory</h1>
      </div>

      {loading ? (
        <div className="admin-page__loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Size</th>
                <th>Color</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className={stockLevel(item.stock_quantity) === 'out' ? 'admin-table__row--danger' : stockLevel(item.stock_quantity) === 'low' ? 'admin-table__row--warning' : ''}>
                  <td><strong>{item.product_name}</strong></td>
                  <td className="admin-table__mono">{item.sku}</td>
                  <td>{item.size_name}</td>
                  <td>{item.color_name}</td>
                  <td>₹{item.price.toLocaleString('en-IN')}</td>
                  <td>
                    <input
                      type="number"
                      className="admin-table__stock-input"
                      value={editingStock[item.id] !== undefined ? editingStock[item.id] : item.stock_quantity}
                      onChange={(e) => handleStockChange(item.id, e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${stockLevel(item.stock_quantity) === 'out' ? 'danger' : stockLevel(item.stock_quantity) === 'low' ? 'warning' : 'success'}`}>
                      {stockLevel(item.stock_quantity) === 'out' ? 'Out of Stock' : stockLevel(item.stock_quantity) === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    {editingStock[item.id] !== undefined && editingStock[item.id] !== item.stock_quantity && (
                      <button className="admin-table__action-btn admin-table__action-btn--save" onClick={() => saveStock(item)}>
                        <FiSave />
                      </button>
                    )}
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

export default InventoryManagement;
