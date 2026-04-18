import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { useNavigate } from 'react-router-dom';
import { updateBalance } from '../features/authSlice';
import apiClient from '../services/apiClient';
import '../styles/dashboard.css';

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000];

const TopUpPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading } = useAppSelector((state) => state.auth);
    const [isSuccess, setIsSuccess] = useState(false);

    const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[0]);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [paymentData, setPaymentData] = useState<{ orderCode: string, qrUrl: string } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(300); // Đếm ngược 5 phút (300 giây)

    const handleTopUp = async () => {
        const topUpValue = customAmount
            ? parseInt(customAmount.replace(/,/g, ''), 10)
            : amount;

        if (isNaN(topUpValue) || topUpValue <= 0) {
            setError("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        setError(null);

        try {
            const response = await apiClient.post('/transactions/create-topup', { amount: topUpValue });

            setPaymentData({
                orderCode: response.data.orderCode,
                qrUrl: response.data.qrUrl
            });

            setTimeLeft(300); // Đặt lại thời gian đếm ngược về 5 phút mỗi khi tạo giao dịch
            setIsPolling(true);
        } catch (err: any) {
            setError("Có lỗi xảy ra khi tạo giao dịch.");
        }
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (/^\d*$/.test(value)) {
            if (value === '') {
                setCustomAmount('');
                setAmount(0);
            } else {
                setCustomAmount(Number(value).toLocaleString('vi-VN'));
                setAmount(0);
            }
        }
    };

    const handleCancel = useCallback(async () => {
        if (paymentData) {
            try {
                await apiClient.post('/transactions/cancel', {
                    orderCode: paymentData.orderCode
                });
            } catch (error) {
                console.error(error);
            } finally {
                setPaymentData(null);
                setIsPolling(false);
            }
        }
    }, [paymentData]);

    useEffect(() => {
        if (!isPolling || !paymentData) return;

        if (timeLeft <= 0) {
            handleCancel();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isPolling, paymentData, timeLeft, handleCancel]);

    useEffect(() => {
        let interval: number | undefined;

        if (isPolling && paymentData) {
            interval = window.setInterval(async () => {
                try {
                    const res = await apiClient.get(`/transactions/status/${paymentData.orderCode}`);

                    if (res.data.status === 'success') {
                        setIsPolling(false);
                        window.clearInterval(interval);

                        dispatch(updateBalance(res.data.newBalance));

                        setIsSuccess(true);

                        setTimeout(() => {
                            navigate('/profile');
                        }, 2000);
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 3000);
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isPolling, paymentData, dispatch, navigate]);
    
    if (isSuccess) {
        return (
            <div className="payment-container">
                <div className="payment-card payment-success">

                    <div className="success-animation">
                        <svg viewBox="0 0 52 52" className="checkmark">
                            <circle cx="26" cy="26" r="25" fill="none" />
                            <path fill="none" d="M14 27l7 7 16-16" />
                        </svg>
                    </div>

                    <h3>Thanh toán thành công</h3>
                    <p>Số dư đã được cập nhật</p>

                </div>
            </div>
        );
    }
    if (paymentData) {
        return (
            <div className="payment-container">
                <div className="payment-card">
                    <h2 className="payment-title">Quét mã QR để thanh toán</h2>
                    <p className="payment-desc">
                        Mở ứng dụng ngân hàng và quét mã bên dưới
                    </p>

                    <div className="qr-wrapper">
                        <img src={paymentData.qrUrl} alt="QR Code" />
                    </div>

                    <div className="payment-code">
                        Nội dung chuyển khoản:
                        <br />
                        <strong>{paymentData.orderCode}</strong>
                    </div>

                    <div className="payment-status">
                        <div className="spinner"></div>
                        Đang chờ thanh toán... 
                        ({Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')})
                    </div>

                    <button className="btn-cancel-payment" onClick={handleCancel}>
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
                    <h1 className="heading-1">Nạp tiền</h1>
                    <p className="text-muted">
                        Số dư:
                        <strong>
                            {' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(user?.balance || 0)}
                        </strong>
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="form-group">
                    <label className="form-label">Chọn số tiền</label>
                    <div className="preset-amounts">
                        {PRESET_AMOUNTS.map(preset => (
                            <button
                                key={preset}
                                className={`btn-secondary ${amount === preset && !customAmount ? 'active' : ''}`}
                                onClick={() => {
                                    setAmount(preset);
                                    setCustomAmount('');
                                }}
                            >
                                {preset.toLocaleString('vi-VN')}đ
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Hoặc nhập số tiền</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ví dụ: 150,000"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                    />
                </div>

                {error && <div className="error-container">{error}</div>}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                    <button className="btn-primary" onClick={handleTopUp} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopUpPage;