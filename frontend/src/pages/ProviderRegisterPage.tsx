import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle } from 'lucide-react';

import { SERVICES_LIST } from '../constants/services';

const ProviderRegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedServices.length === 0) {
            showToast('Please select at least one service', 'error');
            return;
        }

        try {
            // Register User
            await api.post('/auth/register', { email, password, fullName: name, phoneNumber });

            // Auto-login
            const loginRes = await api.post('/auth/login', { email, password });
            const token = loginRes.data.access_token;
            login(token, loginRes.data.user);

            // Trigger Onboarding for Provider immediately
            // This fixes the "Provider not found" issue permanently for new providers
            // Ideally we'd have a UI for skills, but we'll default it here for the MVP "Wow" factor
            try {
                await api.post('/providers/onboard', { skills: selectedServices });
                await api.post('/providers/status', { isOnline: true });
                await api.patch('/providers/location', { lat: 26.2183, lng: 78.1828 });
            } catch (onboardErr) {
                console.error("Auto-onboarding failed", onboardErr);
            }

            showToast('Welcome Partner! You are now online.', 'success');
            navigate('/provider/dashboard');
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
                        type="tel"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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

                    {/* Service Selection */}
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        <label style={{ fontSize: '14px', color: '#a0a0b0', marginBottom: '8px', display: 'block' }}>
                            Select Your Services
                        </label>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                            maxHeight: '150px', overflowY: 'auto', paddingRight: '5px'
                        }}>
                            {SERVICES_LIST.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => toggleService(service.id)}
                                    style={{
                                        padding: '8px',
                                        fontSize: '12px',
                                        borderRadius: '8px',
                                        background: selectedServices.includes(service.id) ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                        color: selectedServices.includes(service.id) ? 'white' : '#a0a0b0',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        textAlign: 'center',
                                        border: selectedServices.includes(service.id) ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {service.name}
                                </div>
                            ))}
                        </div>
                    </div>

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
