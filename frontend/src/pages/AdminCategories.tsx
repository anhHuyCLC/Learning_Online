import { useState, useEffect } from 'react';
import { getCategories, deleteCategory, saveCategory } from '../services/categoryService';
import '../styles/dashboard.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Lỗi kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        const data = await deleteCategory(id);
        if (data.success) {
          setCategories(categories.filter(c => c.id !== id));
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Lỗi khi xóa danh mục");
      }
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '', status: category.status });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await saveCategory(editingCategory ? { id: editingCategory.id, ...formData } : formData);
      if (data.success) {
        if (editingCategory) {
          setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
        } else {
          setCategories([...categories, { id: data.data?.id || Date.now(), ...formData, courseCount: 0 }]);
        }
        setIsModalOpen(false);
      } else {
        alert(data.message || "Lỗi khi lưu danh mục");
      }
    } catch (err) {
      alert("Lỗi kết nối tới máy chủ khi lưu danh mục");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="heading-1">Quản Lý Danh Mục</h1>
          <p className="text-muted">Quản lý và phân loại các danh mục khóa học trên hệ thống.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <span>➕</span> Thêm danh mục
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="heading-2">Danh sách danh mục</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Số khóa học</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? categories.map(cat => (
                <tr key={cat.id}>
                  <td className='text-mono'>{cat.id}</td>
                  <td className="font-bold">{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>{cat.courseCount}</td>
                  <td>
                    <span className={`status-badge ${cat.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                      {cat.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="btn-secondary btn-sm" onClick={() => handleOpenModal(cat)}>Sửa</button>
                    <button className="btn-danger btn-sm" style={{marginLeft: '8px'}} onClick={() => handleDelete(cat.id)}>Xóa</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center text-muted p-4">Chưa có danh mục nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={(e) => {
            // Đóng Modal nếu click đúng vào nền mờ (không phải click vào content bên trong)
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Tên danh mục</label>
                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ minHeight: '80px' }}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ẩn</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu danh mục</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;