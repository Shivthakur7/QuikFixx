import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Phone, Moon, Smartphone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleSendOtp = async () => {
        if (!phoneNumber) return showToast('Please enter mobile number', 'error');
        try {
            await api.post('/auth/send-otp', { phoneNumber });
            setOtpSent(true);
            showToast('OTP sent successfully', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to send OTP', 'error');
        }
    };

    const handleOtpLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login-otp', { phoneNumber, code: otp });
            login(response.data.access_token, response.data.user);
            showToast('Login Successful', 'success');
            if (response.data.user.provider) {
                navigate('/provider/dashboard');
            } else {
                navigate('/map');
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Invalid OTP', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.access_token, response.data.user);
            showToast('Login Successful', 'success');

            if (response.data.user.provider) {
                navigate('/provider/dashboard');
            } else {
                navigate('/map'); // Or based on previous logic, but map is default for customers
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || 'Invalid Credentials', 'error');
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at top right, #1e1e2f, #0a0a0f)' }}>
            <div className="glass-card" style={{ padding: '40px', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 700 }}>Welcome Back</h2>

                {/* Toggle Login Method */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '10px', marginBottom: '30px' }}>
                    <div
                        onClick={() => setIsOtpLogin(false)}
                        style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', background: !isOtpLogin ? 'var(--color-primary)' : 'transparent', cursor: 'pointer', fontSize: '14px', transition: '0.3s' }}>
                        Email & Password
                    </div>
                    <div
                        onClick={() => setIsOtpLogin(true)}
                        style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', background: isOtpLogin ? 'var(--color-primary)' : 'transparent', cursor: 'pointer', fontSize: '14px', transition: '0.3s' }}>
                        Mobile OTP
                    </div>
                </div>

                {isOtpLogin ? (
                    <form onSubmit={handleOtpLogin}>
                        <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <Smartphone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="tel"
                                placeholder="Mobile Number (e.g. +919876543210)"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>

                        {otpSent && (
                            <div style={{ marginBottom: '20px', position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    className="input-field"
                                    style={{ paddingLeft: '40px' }}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {!otpSent ? (
                            <button type="button" onClick={handleSendOtp} className="btn-primary" style={{ width: '100%' }}>
                                Send OTP
                            </button>
                        ) : (
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                Verify & Login
                            </button>
                        )}
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '30px', position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Sign In
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Don't have an account? <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => navigate('/register')}>Sign Up</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
