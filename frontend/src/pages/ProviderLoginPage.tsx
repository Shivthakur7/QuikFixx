import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Briefcase } from 'lucide-react';

const ProviderLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            const token = res.data.access_token;
            // Check if provider profile exists
            try {
                // We'd ideally check role here, but for now we proceed
            } catch (pErr) {
                console.warn(pErr);
            }

            login(token, res.data.user);
            showToast('Welcome back, Partner!', 'success');
            navigate('/map');
        } catch (err: any) {
            console.error(err);
            showToast('Invalid Provider Credentials', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <div className="glass-card" style={{ padding: '40px', width: '300px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div className="icon-wrapper" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <Briefcase size={32} color="#a29bfe" />
                    </div>
                </div>
                <h2>Provider Portal</h2>
                <p style={{ color: '#a0a0b0', marginBottom: '20px' }}>Access your jobs and earnings</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        className="input-field"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input-field"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn-primary" type="submit">Login to Dashboard</button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '14px' }}>
                    New Partner? <a href="/register/provider" style={{ color: '#a29bfe' }}>Join QuikFixx</a>
                </p>
            </div>
        </div>
    );
};

export default ProviderLoginPage;
