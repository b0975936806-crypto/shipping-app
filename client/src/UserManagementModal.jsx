import React, { useState, useEffect } from 'react';
import api from './api';
import './App.css';

export default function UserManagementModal({ onClose, user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for add/edit
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    can_create: false,
    can_edit: false,
    can_delete: false,
  });

  const fetchUsers = () => {
    setLoading(true);
    api.get('/auth/users')
      .then(r => {
        setUsers(r.data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.response?.data?.error || '取得用戶失敗');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'user', can_create: false, can_edit: false, can_delete: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (u) => {
    setFormData({
      username: u.username,
      password: '',
      role: u.role,
      can_create: !!u.can_create,
      can_edit: !!u.can_edit,
      can_delete: !!u.can_delete,
    });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定刪除此用戶？')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || '刪除失敗');
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || (!formData.password && !editingId)) {
      alert('請填寫帳號與密碼');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/auth/users/${editingId}`, formData);
      } else {
        await api.post('/auth/users', formData);
      }
      resetForm();
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || '儲存失敗');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>用戶管理</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>載入中...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>帳號</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>角色</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>權限</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.username}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.role}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '12px' }}>
                      {u.can_create ? '新增 ' : ''}{u.can_edit ? '編輯 ' : ''}{u.can_delete ? '刪除' : ''}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(u)} style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer' }}>編輯</button>
                      {u.id !== user.id && (
                        <button onClick={() => handleDelete(u.id)} style={{ padding: '4px 8px', cursor: 'pointer', color: 'red' }}>刪除</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ width: '100%' }}>
                + 新增用戶
              </button>
            ) : (
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#f9f9f9' }}>
                <h3 style={{ margin: '0 0 12px 0' }}>{editingId ? '編輯用戶' : '新增用戶'}</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>帳號</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                      style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                      密碼 {editingId && <span style={{ color: '#888', fontWeight: 'normal' }}>（空白表示不改密碼）</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                      placeholder={editingId ? '留空則不修改密碼' : ''}
                      style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>角色</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                      style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      <option value="user">一般用戶</option>
                      <option value="admin">管理者</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['can_create', 'can_edit', 'can_delete'].map(perm => (
                      <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={formData[perm]}
                          onChange={e => setFormData(f => ({ ...f, [perm]: e.target.checked }))}
                        />
                        {{ can_create: '新增', can_edit: '編輯', can_delete: '刪除' }[perm]}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>儲存</button>
                    <button onClick={resetForm} className="btn" style={{ flex: 1 }}>取消</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}