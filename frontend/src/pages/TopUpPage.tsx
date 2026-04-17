import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { useNavigate } from 'react-router-dom';
import { updateBalance } from '../features/authSlice';
import apiClient from '../services/apiClient';
import '../styles/Dashboard.css';

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000];

const TopUpPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAppSelector((state) => state.auth);
    
    const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[0]);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
   
    const [paymentData, setPaymentData] = useState<{ orderCode: string, qrUrl: string } | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    const handleTopUp = async () => {
        const topUpValue = customAmount ? parseInt(customAmount.replace(/,/g, ''), 10) : amount;

        if (isNaN(topUpValue) || topUpValue <= 0) {
            setError("Vui lòng nhập số tiền hợp lệ.");
            return;
        }
        setError(null);

        try {
            const response = await apiClient.post('/transactions/create-topup', { amount: topUpValue });
            
            setPaymentData({ orderCode: response.data.orderCode, qrUrl: response.data.qrUrl });
            setIsPolling(true); 
        } catch (err: any) {
            setError(err || "Có lỗi xảy ra khi tạo giao dịch.");
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

    const handleCancel = async () => {
        if (paymentData) {
            try {
               
                await apiClient.post('/transactions/cancel', { orderCode: paymentData.orderCode });
            } catch (error) {
                console.error("Không thể hủy giao dịch trên server", error);

            } finally {
                setPaymentData(null);
                setIsPolling(false);
            }
        }
    };

    useEffect(() => {
        let interval: number | undefined;
        if (isPolling && paymentData) {
            interval = window.setInterval(async () => {
                try {
                 
                    const response = await apiClient.get(`/transactions/status/${paymentData.orderCode}`);
                    if (response.data.status === 'success') {
                        setIsPolling(false);
                        window.clearInterval(interval); 
                        dispatch(updateBalance(response.data.newBalance)); 
                        alert('Nạp tiền thành công!');
                        navigate('/profile');
                    }
                } catch (error) {
                    console.error("Lỗi khi kiểm tra trạng thái", error);
                }
            }, 3000); // Check mỗi 3 giây
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isPolling, paymentData, navigate, dispatch]);

    if (paymentData) {
        return (
            <div className="dashboard-container" style={{ maxWidth: '600px', margin: '40px auto' }}>
                <div className="card text-center">
                    <h2 className="heading-2 mb-4">Quét mã QR để thanh toán</h2>
                    <p className="text-muted mb-4">Sử dụng ứng dụng ngân hàng để quét mã. Giao dịch sẽ tự động được xử lý.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <img src={paymentData.qrUrl} alt="VietQR" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                    </div>
                    
                    <div className="form-group mt-4">
                        <p>Nội dung chuyển khoản: <strong className="text-mono">{paymentData.orderCode}</strong></p>
                    </div>

                    <div className="loading-container" style={{ height: 'auto', padding: '20px' }}>
                        <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
                        <span style={{ marginLeft: '12px' }}>Đang chờ thanh toán...</span>
                    </div>
                    
                    <button className="btn-secondary mt-4" onClick={handleCancel}>
                        Hủy giao dịch
                    </button>
                </div>
            </div>
        );
    }

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