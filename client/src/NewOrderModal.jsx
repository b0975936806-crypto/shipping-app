import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

export default function NewOrderModal({ onClose, onAdded }) {
  const today = new Date();
  const [date, setDate] = useState(today);
  const [date2, setDate2] = useState(today);
  const [customerName, setCustomerName] = useState('');
  const [totalQty, setTotalQty] = useState('');
  const [images, setImages] = useState([]);
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = customerName.trim() !== '';

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('date', format(date, 'yyyy-MM-dd'));
      fd.append('date2', format(date2, 'yyyy-MM-dd'));
      fd.append('customerName', customerName);
      fd.append('totalQty', totalQty);
      fd.append('status', 'draft');
      fd.append('memo', memo);
      Array.from(images).forEach(img => fd.append('images', img));

      const headers = { 'X-Line-Channel-Secret': import.meta.env.VITE_CHANNEL_SECRET || '' };
      const res = await axios.post('/api/shipping', fd, { headers });
      const orderNo = res.data.orderNo;

      if (images.length > 0) {
        const imageFd = new FormData();
        Array.from(images).forEach(img => imageFd.append('images', img));
        await axios.post(`/api/shipping/${orderNo}/images`, imageFd);
      }

      onAdded();
      onClose();
    } catch (e) {
      console.error('上傳失敗', e);
      const msg = e.response?.data?.error || e.message || '未知錯誤';
      alert('上傳失敗：' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>新增訂單</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <label>下單日 *</label>
            <DatePicker
              selected={date}
              onChange={setDate}
              dateFormat="yyyy-MM-dd"
              popperPlacement="bottom-end"
            />
          </div>

          <div className="form-row">
            <label>撿貨日</label>
            <DatePicker
              selected={date2}
              onChange={setDate2}
              dateFormat="yyyy-MM-dd"
              popperPlacement="bottom-end"
            />
          </div>

          <div className="form-row">
            <label>客戶名稱 *</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="請輸入客戶名稱"
            />
          </div>

          <div className="form-row">
            <label>件數</label>
            <input
              type="text"
              value={totalQty}
              onChange={e => setTotalQty(e.target.value)}
              placeholder="請輸入件數"
            />
          </div>

          <div className="form-row" style={{ display: 'block', marginBottom: '12px' }}>
            <label style={{ marginBottom: '6px', display: 'block' }}>圖片上傳</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => setImages(e.target.files)}
                style={{ fontSize: '13px' }}
              />
              {images.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  已選擇 {images.length} 張
                </span>
              )}
            </div>
          </div>

          <div className="form-row" style={{ display: 'block', marginBottom: '16px' }}>
            <label style={{ marginBottom: '6px', display: 'block' }}>備註</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="請輸入備註"
              rows="3"
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className={isValid ? 'btn btn-primary' : 'btn btn-disabled'}
              style={{ flex: 1 }}
            >
              {isSubmitting ? '上傳中...' : '確認新增'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}