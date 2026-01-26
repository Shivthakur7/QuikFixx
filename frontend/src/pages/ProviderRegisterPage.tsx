import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle } from 'lucide-react';

const ProviderRegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Register User
            await api.post('/auth/register', { email, password, fullName: name, phoneNumber: '9999999999' }); // Todo: Add Phone Input

            // Auto-login
            const loginRes = await api.post('/auth/login', { email, password });
            const token = loginRes.data.access_token;
            login(token, loginRes.data.user);

            // Trigger Onboarding for Provider immediately
            // This fixes the "Provider not found" issue permanently for new providers
            // Ideally we'd have a UI for skills, but we'll default it here for the MVP "Wow" factor
            try {
                await api.post('/providers/onboard', { skills: ['electrician', 'plumber', 'mechanic'] });
                await api.post('/providers/status', { isOnline: true });
                await api.patch('/providers/location', { lat: 26.2183, lng: 78.1828 });
            } catch (onboardErr) {
                console.error("Auto-onboarding failed", onboardErr);
            }

            showToast('Welcome Partner! You are now online.', 'success');
            navigate('/');
        } catch (err) {
            showToast('Registration failed', 'error');
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <div className="glass-card" style={{ padding: '40px', width: '300px', textAlign: 'center' }}>
                <h2>Join as Professional</h2>
                <p style={{ color: '#a0a0b0', marginBottom: '20px' }}>Start earning with QuikFixx</p>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        className="input-field"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
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
                    <button className="btn-primary" type="submit">Create Partner Account</button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '14px' }}>
                    Already a partner? <a href="/login/provider" style={{ color: '#a29bfe' }}>Login</a>
                </p>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#00cec9', fontSize: '12px' }}>
                    <CheckCircle size={14} /> Instant Activation
                </div>
            </div>
        </div>
    );
};

export default ProviderRegisterPage;
