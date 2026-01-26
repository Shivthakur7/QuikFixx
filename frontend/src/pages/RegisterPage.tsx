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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Destructure formData for clarity and to match the requested payload structure
            const { email, password, fullName, phoneNumber } = formData;
            // The instruction explicitly asks to send 'fullName' and to use a random phone number.
            // The 'name' variable in the instruction snippet is interpreted as 'fullName' from formData.
            const response = await api.post('/auth/register', { email, password, fullName: fullName, phoneNumber: phoneNumber });
            login(response.data.access_token, response.data.user);
            showToast('Registration Successful', 'success');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            showToast('Registration failed', 'error');
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

                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
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

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
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
