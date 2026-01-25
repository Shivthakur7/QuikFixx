import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/register', formData);
            login(response.data.access_token, response.data.user);
            navigate('/');
        } catch (err) {
            setError('Registration failed. Email might be in use.');
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at top left, #2d2d44, #0a0a0f)' }}>
            <div className="glass-card" style={{ padding: '40px', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 700 }}>Join QuikFixx</h2>

                {error && <div style={{ color: 'var(--color-danger)', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

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
