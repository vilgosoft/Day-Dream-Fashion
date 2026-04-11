import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import api from '@/services/api';
import { toast } from 'react-toastify';
import './Admin.scss';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  category_name: string;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  primary_image: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '', description: '', category_id: '', base_price: '',
    status: 'active', is_featured: false, is_trending: false,
  });
  const [images, setImages] = useState<File[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchProducts = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getProducts(p);
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.meta?.last_page || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data?.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, [page]);

  const resetForm = () => {
    setForm({ name: '', description: '', category_id: '', base_price: '', status: 'active', is_featured: false, is_trending: false });
    setImages([]);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = async (product: ProductItem) => {
    try {
      const res = await api.get(`/admin/products/${product.id}`);
      const p = res.data?.data;
      setForm({
        name: p.name, description: p.description || '', category_id: String(p.category_id),
        base_price: String(p.base_price), status: p.status,
        is_featured: p.is_featured, is_trending: p.is_trending,
      });
      setEditingId(product.id);
      setImages([]);
      setShowModal(true);
    } catch {
      toast.error('Failed to load product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('category_id', form.category_id);
    formData.append('base_price', form.base_price);
    formData.append('status', form.status);
    formData.append('is_featured', form.is_featured ? '1' : '0');
    formData.append('is_trending', form.is_trending ? '1' : '0');
    images.forEach((img) => formData.append('images[]', img));

    try {
      if (editingId) {
        await adminService.updateProduct(editingId, formData);
        toast.success('Product updated!');
      } else {
        await adminService.createProduct(formData);
        toast.success('Product created!');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Products</h1>
        <button className="admin-page__add-btn" onClick={openCreate}>
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="admin-page__loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-table__thumb">
                      {product.primary_image && (
                        <img src={`${apiUrl}/${product.primary_image}`} alt={product.name} />
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="admin-table__badges">
                      {product.is_featured && <span className="admin-badge admin-badge--featured">Featured</span>}
                      {product.is_trending && <span className="admin-badge admin-badge--trending">Trending</span>}
                    </div>
                  </td>
                  <td>{product.category_name}</td>
                  <td>₹{product.base_price.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${product.status}`}>{product.status}</span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__action-btn" onClick={() => openEdit(product)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="admin-table__action-btn admin-table__action-btn--danger" onClick={() => handleDelete(product.id)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
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

      {/* Modal */}
      {showModal && (
        <div className="admin-modal">
          <div className="admin-modal__overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSubmit}>
              <div className="admin-modal__field">
                <label>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-modal__field">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="admin-modal__row">
                <div className="admin-modal__field">
                  <label>Category *</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-modal__field">
                  <label>Base Price *</label>
                  <input type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} required />
                </div>
              </div>
              <div className="admin-modal__row">
                <div className="admin-modal__field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="admin-modal__field admin-modal__field--checkboxes">
                  <label>
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                    Featured
                  </label>
                  <label>
                    <input type="checkbox" checked={form.is_trending} onChange={(e) => setForm({ ...form, is_trending: e.target.checked })} />
                    Trending
                  </label>
                </div>
              </div>
              <div className="admin-modal__field">
                <label><FiUpload /> Images</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
              </div>
              <div className="admin-modal__actions">
                <button type="button" className="admin-modal__cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-modal__submit">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
