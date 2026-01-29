import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.access_token, response.data.user);
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
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 700 }}>Welcome Back</h2>

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

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Don't have an account? <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => navigate('/register')}>Sign Up</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
