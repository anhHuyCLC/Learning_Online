import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { useNavigate } from 'react-router-dom';
import { topUpBalance } from '../features/authSlice'; // Sẽ tạo ở bước sau
import '../styles/Dashboard.css'; // Tái sử dụng style

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000];

const TopUpPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAppSelector((state) => state.auth);
    
    const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[0]);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleTopUp = async () => {
        const topUpValue = customAmount ? parseInt(customAmount.replace(/,/g, ''), 10) : amount;

        if (isNaN(topUpValue) || topUpValue <= 0) {
            setError("Vui lòng nhập số tiền hợp lệ.");
            return;
        }
        setError(null);

        try {
            await dispatch(topUpBalance(topUpValue)).unwrap();
            alert('Nạp tiền thành công!');
            navigate('/profile');
        } catch (err: any) {
            setError(err || "Có lỗi xảy ra khi nạp tiền.");
        }
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (/^\d*$/.test(value)) {
            if (value === '') {
                setCustomAmount('');
                setAmount(0);
            } else {
                setCustomAmount(Number(value).toLocaleString('en-US'));
                setAmount(0);
            }
        }
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '700px', margin: '40px auto' }}>
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="heading-1">Nạp tiền vào tài khoản</h1>
                    <p className="text-muted">Số dư hiện tại: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user?.balance || 0)}</strong></p>
                </div>
            </div>

            <div className="card">
                <div className="form-group">
                    <label className="form-label">Chọn số tiền muốn nạp</label>
                    <div className="preset-amounts">
                        {PRESET_AMOUNTS.map(preset => (
                            <button
                                key={preset}
                                className={`btn-secondary ${amount === preset && !customAmount ? 'active' : ''}`}
                                onClick={() => { setAmount(preset); setCustomAmount(''); }}
                            >
                                {preset.toLocaleString('vi-VN')}đ
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Hoặc nhập số tiền khác</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ví dụ: 150,000"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                    />
                </div>

                {error && <div className="error-container" style={{ height: 'auto', padding: '12px', marginBottom: '20px' }}>{error}</div>}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                    <button className="btn-primary" onClick={handleTopUp} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopUpPage;