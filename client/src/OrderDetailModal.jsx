import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import imageCompression from 'browser-image-compression';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

export default function OrderDetailModal({ orderNo, onClose, onUpdated, onDeleted }) {
  const [order, setOrder] = useState(null);
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [totalQty, setTotalQty] = useState('');
  const [memo, setMemo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  // Touch swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const headers = { 'X-Line-Channel-Secret': import.meta.env.VITE_CHANNEL_SECRET || '' };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNo]);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/shipping/${orderNo}`);
      setOrder(res.data);
      setImages(res.data.images || []);
      setTotalQty(res.data.totalQty || '');
      setMemo(res.data.memo || '');
      setEditCustomerName(res.data.customerName || '');
    } catch (e) {
      console.error('Failed to fetch order', e);
      alert('載入失敗');
      onClose();
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('確定刪除這張圖片？')) return;
    try {
      await api.delete(`/shipping/${orderNo}/images/${imageId}`, { headers });
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
      const compressionOptions = {
        maxWidthOrHeight: 1500,
        useWebWorker: true,
        maxSizeMB: 1,
        maxIteration: 10,
      };

      const compressedFiles = await Promise.all(
        Array.from(files).map(file => imageCompression(file, compressionOptions))
      );

      await Promise.all(
        compressedFiles.map(file => {
          const fd = new FormData();
          fd.append('images', file, file.name);
          return api.post(`/shipping/${orderNo}/images`, fd);
        })
      );
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
      await api.put(`/shipping/${orderNo}`, {
        customerName: editCustomerName,
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
      await api.delete(`/shipping/${orderNo}`, { headers });
      onDeleted();
      onClose();
    } catch (e) {
      console.error('Failed to delete order', e);
      alert('刪除失敗');
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const newIdx = Math.max(0, enlargedIndex - 1);
    setEnlargedIndex(newIdx);
    setEnlargedImage(`/api/uploads/${images[newIdx].imagePath}`);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const newIdx = Math.min(images.length - 1, enlargedIndex + 1);
    setEnlargedIndex(newIdx);
    setEnlargedImage(`/api/uploads/${images[newIdx].imagePath}`);
  };

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    // Prevent scroll if horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only trigger if horizontal swipe > 50px and not a vertical scroll
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && enlargedIndex < images.length - 1) {
        // Swipe left -> next
        const newIdx = enlargedIndex + 1;
        setEnlargedIndex(newIdx);
        setEnlargedImage(`/api/uploads/${images[newIdx].imagePath}`);
      } else if (deltaX > 0 && enlargedIndex > 0) {
        // Swipe right -> prev
        const newIdx = enlargedIndex - 1;
        setEnlargedIndex(newIdx);
        setEnlargedImage(`/api/uploads/${images[newIdx].imagePath}`);
      }
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
            {isEditing ? (
              <input
                type="text"
                value={editCustomerName}
                onChange={e => setEditCustomerName(e.target.value)}
              />
            ) : (
              <span>{order.customerName}</span>
            )}
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
              {images.map((img, idx) => (
                <div key={img.id} className="image-thumb">
                  <img
                    src={`/api/uploads/${img.imagePath}`}
                    alt=""
                    onClick={() => { setEnlargedImage(`/api/uploads/${img.imagePath}`); setEnlargedIndex(idx); }}
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
          <div
            className="modal-overlay"
            onClick={() => setEnlargedImage(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={enlargedImage}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
                onClick={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
              />
              <button
                onClick={() => setEnlargedImage(null)}
                style={{
                  position: 'absolute', top: '-12px', right: '-12px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#333', color: 'white', border: '2px solid white',
                  fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                }}
              >
                ×
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%)',
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#333', color: 'white', border: '2px solid white',
                      fontSize: '22px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: enlargedIndex === 0 ? 0.3 : 1,
                      pointerEvents: enlargedIndex === 0 ? 'none' : 'auto'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)',
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#333', color: 'white', border: '2px solid white',
                      fontSize: '22px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: enlargedIndex === images.length - 1 ? 0.3 : 1,
                      pointerEvents: enlargedIndex === images.length - 1 ? 'none' : 'auto'
                    }}
                  >
                    ›
                  </button>
                  <div style={{
                    position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)',
                    color: 'white', fontSize: '13px', background: 'rgba(0,0,0,0.6)',
                    padding: '2px 10px', borderRadius: '12px'
                  }}>
                    {enlargedIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}