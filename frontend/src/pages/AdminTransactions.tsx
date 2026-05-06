import { useState, useEffect } from 'react';
import { getTransactions, getTransactionStats } from '../services/transactionService';
import '../styles/dashboard.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    totalDeposited: 0,
    totalPending: 0
  });

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

      if (txData?.success) {
        setTransactions(txData.data || []);
      }

      if (statsData?.success) {
        const backendStats = statsData.stats || statsData.data?.stats || {};
        setStats({
          totalDeposited: Number(backendStats.totalDeposited) || 0,
          totalPending: Number(backendStats.totalPending) || 0
        });
      }

    } catch (err) {
      setError("Lỗi kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };


  const filteredTransactions = transactions.filter(trx =>
    filterStatus === 'all' ? true : trx.status === filterStatus
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="heading-1">Quản Lý Giao Dịch</h1>
          <p className="text-muted">Theo dõi dòng tiền, nạp tiền và trạng thái thanh toán trên hệ thống.</p>
        </div>
      </div>

      <div className="stats-grid mb-6">
        <div className="stat-card">
          <p className="stat-title">Tổng Tiền Đã Nạp (Completed)</p>
          <h3 className="stat-value" style={{ color: 'var(--f8-success)' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalDeposited || 0)}
          </h3>
        </div>
        <div className="stat-card">
          <p className="stat-title">Tiền Đang Chờ (Pending)</p>
          <h3 className="stat-value" style={{ color: 'var(--f8-warning)' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalPending || 0)}
          </h3>
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
            <option value="completed">Hoàn thành</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
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
                  <th>Mã Order (Sepay)</th>
                  <th>Người dùng</th>
                  <th>Loại GD</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? filteredTransactions.map((trx, index) => (
                  <tr key={trx.id || index}>
                    <td className='text-mono font-bold'>#{trx.id}</td>

                    {/* Cột payment_method hiện đang lưu mã Order */}
                    <td className='text-mono' style={{ color: '#64748b' }}>
                      {trx.payment_method || 'N/A'}
                    </td>

                    {/* Lấy tên user từ câu query JOIN */}
                    <td className="font-medium">{trx.user_name || `User ID: ${trx.user_id}`}</td>

                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px',
                        backgroundColor: '#e0f2fe', color: '#0369a1',
                        fontSize: '12px', fontWeight: 500
                      }}>
                        Nạp ví
                      </span>
                    </td>

                    <td className="font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(trx.amount) || 0)}
                    </td>

                    <td>{trx.created_at ? new Date(trx.created_at).toLocaleString('vi-VN') : 'N/A'}</td>

                    <td>{trx.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted p-4">Không có giao dịch nào ở trạng thái này.</td>
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
