import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import NewOrderModal from './NewOrderModal';
import OrderDetailModal from './OrderDetailModal';
import UserManagementModal from './UserManagementModal';

const today = new Date();

const Stats = ({ stats, user, onUserManagementClick }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
    {[
      { label: '今日', value: stats.today },
      { label: '本週', value: stats.week },
      { label: '本月', value: stats.month },
      { label: '年度', value: stats.year, clickable: true },
    ].map(s => (
      <div
        key={s.label}
        className="stats-card"
        onClick={s.clickable && user.role === 'admin' ? onUserManagementClick : undefined}
        style={s.clickable && user.role === 'admin' ? { cursor: 'pointer' } : undefined}
      >
        <div className="stats-label">{s.label}</div>
        <div className="stats-value">{s.value}</div>
      </div>
    ))}
  </div>
);

const QueryForm = ({ startDate, endDate, customer, onChange, onSubmit, onAdd }) => (
  <div className="query-form">
    <div>
      <label>開始日</label>
      <DatePicker
        selected={startDate}
        onChange={onChange.start}
        dateFormat="yyyy-MM-dd"
        popperPlacement="bottom-end"
      />
    </div>
    <div>
      <label>截止日</label>
      <DatePicker
        selected={endDate}
        onChange={onChange.end}
        dateFormat="yyyy-MM-dd"
        popperPlacement="bottom-end"
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
      <button
        onClick={onAdd}
        className="btn btn-cta"
        style={{ width: '100%' }}
      >
        新增
      </button>
    </div>
    <div style={{ gridColumn: 'span 2' }}>
      <label>客戶</label>
      <input
        type="text"
        value={customer}
        onChange={onChange.customer}
        placeholder="輸入客戶名稱"
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
      <button
        onClick={onSubmit}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        查詢
      </button>
    </div>
  </div>
);

const OrderCard = ({ order, onClick }) => (
  <div onClick={onClick} className="order-card">
    <div className="order-card-header">
      <div className="order-card-header-title">訂單日: {order.orderNo}</div>
    </div>
    <div className="order-card-body">
      <div className="order-card-row">
        <span className="order-card-label">📅 下單</span>
        <span className="order-card-value">{order.date}</span>
      </div>
      <div className="order-card-row">
        <span className="order-card-label">📦 撿貨</span>
        <span className="order-card-value">{order.date2 || '-'}</span>
      </div>
      <div className="order-card-row">
        <span className="order-card-label">👤 客戶</span>
        <span className="order-card-value">{order.customerName}</span>
      </div>
      <div className="order-card-row">
        <span className="order-card-label">📦 件數</span>
        <span className="order-card-value">{order.totalQty} 件 / {order.totalBoxes} 箱</span>
      </div>
      <div className="order-card-row">
        <span className="order-card-label">🖼 圖片</span>
        <span className="order-card-value">{order.imageqt || 0}</span>
      </div>
      {order.memo && (
        <div className="order-card-row">
          <span className="order-card-label">📝 備註</span>
          <span className="order-card-value">{order.memo}</span>
        </div>
      )}
    </div>
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, year: 0 });
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [customer, setCustomer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderNo, setSelectedOrderNo] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });

  const fetchStats = () => {
    api.get('/stats').then(r => setStats(r.data)).catch(console.error);
  };

  const fetchOrders = (start = startDate, end = endDate, cust = customer) => {
    const params = {
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
    };
    if (cust) params.customer = cust;
    api.get('/shipping', { params }).then(r => setOrders(r.data)).catch(console.error);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // 從 server 取最新權限資料
    api.get('/auth/me').then(res => {
      const freshUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
    }).catch(() => {
      // token 過期，清除並跳 login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    });
    fetchStats();
    fetchOrders();
  }, []);

  const handleSubmit = () => {
    fetchOrders();
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleCardClick = (orderNo) => {
    setSelectedOrderNo(orderNo);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleDetailModalClose = () => {
    setSelectedOrderNo(null);
  };

  const handleOrderAdded = () => {
    fetchOrders();
    fetchStats();
  };

  const handleOrderUpdated = () => {
    fetchOrders();
    fetchStats();
  };

  const handleOrderDeleted = () => {
    fetchOrders();
    fetchStats();
  };

  return (
    <div style={{ padding: '8px 16px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text)' }}>訂單紀錄</h1>
      <Stats stats={stats} user={user} onUserManagementClick={() => setShowUserManagement(true)} />
      <QueryForm
        startDate={startDate}
        endDate={endDate}
        customer={customer}
        onChange={{
          start: setStartDate,
          end: setEndDate,
          customer: e => setCustomer(e.target.value),
        }}
        onSubmit={handleSubmit}
        onAdd={handleAdd}
      />
      <div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">尚無訂單資料</div>
          </div>
        ) : (
          orders.map(o => <OrderCard key={o.id} order={o} onClick={() => handleCardClick(o.orderNo)} />)
        )}
      </div>
      {showModal && <NewOrderModal onClose={handleModalClose} onAdded={handleOrderAdded} />}
      {selectedOrderNo && (
        <OrderDetailModal
          orderNo={selectedOrderNo}
          onClose={handleDetailModalClose}
          onUpdated={handleOrderUpdated}
          onDeleted={handleOrderDeleted}
        />
      )}
      {showUserManagement && (
        <UserManagementModal
          onClose={() => setShowUserManagement(false)}
          user={user}
        />
      )}
    </div>
  );
}