import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogOut, Settings, Award, MapPin } from 'lucide-react';

const ProviderProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login/provider');
    };

    return (
        <div className="app-container">
            {/* Header */}
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ArrowLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
                <h2 style={{ margin: 0 }}>My Profile</h2>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '15px', fontSize: '32px', fontWeight: 'bold'
                }}>
                    {user?.fullName?.charAt(0) || 'P'}
                </div>
                <h3 style={{ margin: '0 0 5px 0' }}>{user?.fullName}</h3>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{user?.email}</p>
                <div style={{ marginTop: '10px', padding: '5px 12px', background: 'rgba(108, 92, 231, 0.2)', borderRadius: '20px', color: '#a29bfe', fontSize: '12px' }}>
                    Verified Partner
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a0a0b0', fontSize: '14px', marginTop: '10px' }}>
                    <MapPin size={14} />
                    <span>{user?.address || 'Operational Area: Gwalior'}</span>
                </div>

                {/* Services Section */}
                {user?.provider?.skillTags && user.provider.skillTags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {user.provider.skillTags.map((skill: string, index: number) => (
                            <div key={index} style={{
                                padding: '6px 14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '15px',
                                color: '#dfe6e9',
                                fontSize: '13px',
                                textTransform: 'capitalize'
                            }}>
                                {skill}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: '20px' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '15px', cursor: 'pointer' }}>
                    <Settings size={20} style={{ marginRight: '15px', color: '#a0a0b0' }} />
                    <span style={{ flex: 1 }}>Account Settings</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '15px', cursor: 'pointer' }}>
                    <Award size={20} style={{ marginRight: '15px', color: '#a0a0b0' }} />
                    <span style={{ flex: 1 }}>Reviews & Ratings</span>
                </div>
                <div
                    onClick={handleLogout}
                    className="glass-card"
                    style={{ display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '15px', cursor: 'pointer', border: '1px solid rgba(255, 107, 107, 0.3)', background: 'rgba(255, 107, 107, 0.05)' }}
                >
                    <LogOut size={20} style={{ marginRight: '15px', color: '#ff6b6b' }} />
                    <span style={{ flex: 1, color: '#ff6b6b' }}>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default ProviderProfilePage;
