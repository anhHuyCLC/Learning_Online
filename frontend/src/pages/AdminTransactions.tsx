import { useState, useEffect } from 'react';
import { getTransactions, getTransactionStats } from '../services/transactionService';
import '../styles/Dashboard.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSuccess: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txData, statsData] = await Promise.all([
        getTransactions(),
        getTransactionStats()
      ]);
      
      if (txData.success) setTransactions(txData.data);
      if (statsData.success) setStats(statsData.data);
      
    } catch (err) {
      setError("Lỗi kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success': return <span className="status-badge badge-emerald">Thành công</span>;
      case 'failed': return <span className="status-badge badge-rose">Thất bại</span>;
      case 'pending': return <span className="status-badge badge-amber">Đang xử lý</span>;
      case 'completed': return <span className="status-badge badge-emerald">Hoàn thành</span>;
      default: return <span className="status-badge">Unknown</span>;
    }
  };

  const filteredTransactions = transactions.filter(trx => 
    filterStatus === 'all' ? true : trx.status === filterStatus
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="heading-1">Lịch Sử Giao Dịch</h1>
          <p className="text-muted">Theo dõi dòng tiền, nạp tiền và giao dịch thanh toán.</p>
        </div>
      </div>

      <div className="stats-grid mb-6">
        <div className="stat-card">
          <p className="stat-title">Tổng Giao Dịch Thành Công</p>
          <h3 className="stat-value" style={{color: 'var(--f8-success)'}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalSuccess)}</h3>
        </div>
        <div className="stat-card">
          <p className="stat-title">Giao Dịch Đang Xử Lý</p>
          <h3 className="stat-value" style={{color: 'var(--f8-warning)'}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalPending)}</h3>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="heading-2">Danh sách giao dịch ({filteredTransactions.length})</h2>
          <select 
            className="form-input" 
            style={{ width: 'auto', padding: '6px 12px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="completed">Hoàn thành</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : error ? (
          <div className="error-container">{error}</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Người dùng</th>
                  <th>Loại GD</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? filteredTransactions.map(trx => (
                  <tr key={trx.id}>
                    <td className='text-mono font-bold'>TRX-{trx.id}</td>
                    <td>{trx.user}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: (trx.type === 'Nạp tiền' || trx.type === 'top-up') ? '#e0f2fe' : '#f3e8ff',
                        color: (trx.type === 'Nạp tiền' || trx.type === 'top-up') ? '#0369a1' : '#7e22ce',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {trx.type === 'top-up' ? 'Nạp tiền' : trx.type === 'course_purchase' ? 'Mua khóa học' : trx.type}
                      </span>
                    </td>
                    <td className="font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trx.amount)}
                    </td>
                    <td>{new Date(trx.date).toLocaleString('vi-VN')}</td>
                    <td>{getStatusBadge(trx.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted p-4">Không có giao dịch nào ở trạng thái này.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;