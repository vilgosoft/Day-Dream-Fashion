import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import api from '@/services/api';
import { toast } from 'react-toastify';
import './Admin.scss';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  status: string;
  children?: CategoryItem[];
}

interface SizeItem { id: number; name: string; }
interface ColorItem { id: number; name: string; hex_code: string; }

const CategoryManagement = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active', parent_id: '' });
  const [image, setImage] = useState<File | null>(null);

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState({ name: '', hex_code: '#000000' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, sizeRes, colorRes] = await Promise.all([
        adminService.getCategories(),
        api.get('/admin/sizes').catch(() => ({ data: { data: [] } })),
        api.get('/admin/colors').catch(() => ({ data: { data: [] } })),
      ]);
      setCategories(catRes.data?.data || []);
      setSizes(sizeRes.data?.data || []);
      setColors(colorRes.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const flatCategories = (cats: CategoryItem[], depth = 0): (CategoryItem & { depth: number })[] => {
    const result: (CategoryItem & { depth: number })[] = [];
    cats.forEach((cat) => {
      result.push({ ...cat, depth });
      if (cat.children?.length) result.push(...flatCategories(cat.children, depth + 1));
    });
    return result;
  };

  const resetForm = () => {
    setForm({ name: '', description: '', status: 'active', parent_id: '' });
    setImage(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('status', form.status);
    if (form.parent_id) formData.append('parent_id', form.parent_id);
    if (image) formData.append('image', image);

    try {
      if (editingId) {
        await adminService.updateCategory(editingId, formData);
        toast.success('Category updated!');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created!');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddSize = async () => {
    if (!newSize.trim()) return;
    try {
      await api.post('/admin/sizes', { name: newSize });
      toast.success('Size added');
      setNewSize('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add size');
    }
  };

  const handleAddColor = async () => {
    if (!newColor.name.trim()) return;
    try {
      await api.post('/admin/colors', newColor);
      toast.success('Color added');
      setNewColor({ name: '', hex_code: '#000000' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add color');
    }
  };

  const flat = flatCategories(categories);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Categories & Attributes</h1>
        <button className="admin-page__add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="admin-page__loading">Loading...</div>
      ) : (
        <>
          {/* Categories Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>Image</th><th>Name</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {flat.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="admin-table__thumb">
                        {cat.image && <img src={`${apiUrl}/${cat.image}`} alt={cat.name} />}
                      </div>
                    </td>
                    <td style={{ paddingLeft: `${cat.depth * 24 + 12}px` }}>
                      {cat.depth > 0 && '└ '}{cat.name}
                    </td>
                    <td><span className={`admin-badge admin-badge--${cat.status}`}>{cat.status}</span></td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-table__action-btn" onClick={() => {
                          setForm({ name: cat.name, description: cat.description, status: cat.status, parent_id: '' });
                          setEditingId(cat.id);
                          setShowModal(true);
                        }}><FiEdit2 /></button>
                        <button className="admin-table__action-btn admin-table__action-btn--danger" onClick={() => handleDelete(cat.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sizes & Colors */}
          <div className="admin-attributes">
            <div className="admin-attributes__section">
              <h3>Sizes</h3>
              <div className="admin-attributes__list">
                {sizes.map((s) => (
                  <span key={s.id} className="admin-attributes__tag">{s.name}</span>
                ))}
              </div>
              <div className="admin-attributes__add">
                <input type="text" placeholder="New size (e.g. XXL)" value={newSize} onChange={(e) => setNewSize(e.target.value)} />
                <button onClick={handleAddSize}><FiPlus /></button>
              </div>
            </div>

            <div className="admin-attributes__section">
              <h3>Colors</h3>
              <div className="admin-attributes__list">
                {colors.map((c) => (
                  <span key={c.id} className="admin-attributes__tag">
                    <span className="admin-attributes__color-dot" style={{ backgroundColor: c.hex_code }} />
                    {c.name}
                  </span>
                ))}
              </div>
              <div className="admin-attributes__add">
                <input type="text" placeholder="Color name" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} />
                <input type="color" value={newColor.hex_code} onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })} />
                <button onClick={handleAddColor}><FiPlus /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal">
          <div className="admin-modal__overlay" onClick={() => setShowModal(false)} />
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
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
                  <label>Parent Category</label>
                  <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                    <option value="">None (Top Level)</option>
                    {flat.filter((c) => c.id !== editingId).map((cat) => (
                      <option key={cat.id} value={cat.id}>{'—'.repeat(cat.depth)} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-modal__field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal__field">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
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

export default CategoryManagement;
