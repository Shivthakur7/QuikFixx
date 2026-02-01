import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, Phone } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.phoneNumber) return showToast('Please enter mobile number', 'error');
        try {
            await api.post('/auth/send-otp', { phoneNumber: formData.phoneNumber });
            setOtpSent(true);
            showToast('OTP sent to ' + formData.phoneNumber, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to send OTP', 'error');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await api.post('/auth/verify-otp', { phoneNumber: formData.phoneNumber, code: otp });
            if (res.data.success) {
                setIsPhoneVerified(true);
                setOtpSent(false); // Hide OTP field
                showToast('Phone Number Verified!', 'success');
            } else {
                showToast('Invalid OTP', 'error');
            }
        } catch (err: any) {
            showToast('Verification Failed', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPhoneVerified) {
            return showToast('Please verify your phone number first', 'error');
        }
        if (!emailRegex.test(formData.email)) {
            return showToast('Please enter a valid email address', 'error');
        }
        try {
            // Destructure formData for clarity and to match the requested payload structure
            const { email, password, fullName, phoneNumber } = formData;
            // The instruction explicitly asks to send 'fullName' and to use a random phone number.
            // The 'name' variable in the instruction snippet is interpreted as 'fullName' from formData.
            const response = await api.post('/auth/register', { email, password, fullName: fullName, phoneNumber: phoneNumber });
            login(response.data.access_token, response.data.user);
            showToast('Registration Successful', 'success');

            navigate('/map');
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || 'Registration failed';
            showToast(Array.isArray(message) ? message[0] : message, 'error');
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at top left, #2d2d44, #0a0a0f)' }}>
            <div className="glass-card" style={{ padding: '40px', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 700 }}>Create Account</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                className="input-field"
                                style={{ paddingLeft: '40px', paddingRight: isPhoneVerified ? '40px' : '90px' }}
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                disabled={isPhoneVerified}
                                required
                            />
                            {isPhoneVerified && <Lock size={16} color="#00b894" style={{ position: 'absolute', right: '12px', top: '15px' }} />}

                            {!isPhoneVerified && formData.phoneNumber.length > 9 && !otpSent && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    style={{
                                        position: 'absolute', right: '5px', top: '5px', bottom: '5px',
                                        background: 'var(--color-primary)', border: 'none', borderRadius: '8px',
                                        color: 'white', fontSize: '12px', padding: '0 10px', cursor: 'pointer'
                                    }}>
                                    Verify
                                </button>
                            )}
                        </div>
                        {otpSent && !isPhoneVerified && (
                            <div style={{ display: 'flex', marginTop: '10px', gap: '5px' }}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="input-field"
                                    style={{ flex: 1 }}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <button type="button" onClick={handleVerifyOtp} className="btn-primary" style={{ padding: '0 15px' }}>Check</button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', opacity: isPhoneVerified ? 1 : 0.6, cursor: isPhoneVerified ? 'pointer' : 'not-allowed' }} disabled={!isPhoneVerified}>
                        Create Account
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Already have an account? <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign In</span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
