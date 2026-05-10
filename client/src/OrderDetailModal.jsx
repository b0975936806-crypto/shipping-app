import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

export default function OrderDetailModal({ orderNo, onClose, onUpdated, onDeleted }) {
  const [order, setOrder] = useState(null);
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [totalQty, setTotalQty] = useState('');
  const [memo, setMemo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  const headers = { 'X-Line-Channel-Secret': import.meta.env.VITE_CHANNEL_SECRET || '' };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNo]);

  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(`/api/shipping/${orderNo}`);
      setOrder(res.data);
      setImages(res.data.images || []);
      setTotalQty(res.data.totalQty || '');
      setMemo(res.data.memo || '');
    } catch (e) {
      console.error('Failed to fetch order', e);
      alert('載入失敗');
      onClose();
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('確定刪除這張圖片？')) return;
    try {
      await axios.delete(`/api/shipping/${orderNo}/images/${imageId}`, { headers });
      setImages(images.filter(img => img.id !== imageId));
    } catch (e) {
      console.error('Failed to delete image', e);
      alert('刪除失敗');
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(img => fd.append('images', img));
      await axios.post(`/api/shipping/${orderNo}/images`, fd, { headers });
      await fetchOrderDetail();
    } catch (e) {
      console.error('Failed to upload images', e);
      alert('上傳失敗');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/shipping/${orderNo}`, {
        totalQty,
        memo,
        date2: order.date2
      }, { headers });
      onUpdated();
      onClose();
    } catch (e) {
      console.error('Failed to update', e.response?.data, e.message);
      const msg = e.response?.data?.error || e.message || '未知錯誤';
      alert('更新失敗：' + msg);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`/api/shipping/${orderNo}`, { headers });
      onDeleted();
      onClose();
    } catch (e) {
      console.error('Failed to delete order', e);
      alert('刪除失敗');
    }
  };

  if (!order) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>訂單日: {orderNo}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <label>下單日</label>
            <span>{order.date}</span>
          </div>

          <div className="form-row">
            <label>撿貨日</label>
            <span>{order.date2 || '-'}</span>
          </div>

          <div className="form-row">
            <label>客戶</label>
            <span>{order.customerName}</span>
          </div>

          <div className="form-row">
            <label>件數</label>
            {isEditing ? (
              <input
                type="text"
                value={totalQty}
                onChange={e => setTotalQty(e.target.value)}
              />
            ) : (
              <span>{order.totalQty}</span>
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                {isEditing ? '圖片上傳' : '圖片'}
              </label>
            </div>

            {isEditing && (
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ fontSize: '13px' }}
                />
                {isUploading && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>上傳中...</span>}
              </div>
            )}

            <div className="image-upload-area">
              {images.length === 0 && (
                <div className="image-placeholder">無圖片</div>
              )}
              {images.map(img => (
                <div key={img.id} className="image-thumb">
                  <img
                    src={`/api/uploads/${img.imagePath}`}
                    alt=""
                    onClick={() => setEnlargedImage(`/api/uploads/${img.imagePath}`)}
                    style={{ cursor: 'pointer' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="image-thumb-delete"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block' }}>備註</label>
            {isEditing ? (
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows="3"
              />
            ) : (
              <span>{order.memo || '-'}</span>
            )}
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  刪除訂單
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  取消
                </button>
                <button
                  onClick={handleUpdate}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  更新
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  刪除訂單
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  編輯
                </button>
              </>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h4>確認刪除？</h4>
              <p>刪除後無法恢復</p>
              <div className="confirm-buttons">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="btn btn-danger"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {enlargedImage && (
          <div className="modal-overlay" onClick={() => setEnlargedImage(null)}>
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={enlargedImage}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
                onClick={e => e.stopPropagation()}
              />
              <button
                onClick={() => setEnlargedImage(null)}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#333',
                  color: 'white',
                  border: '2px solid white',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}