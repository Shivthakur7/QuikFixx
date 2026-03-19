import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import { Users, Briefcase, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [stats, setStats] = useState<any>(null);
    const [pendingKyc, setPendingKyc] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    if (!user?.isAdmin) {
        return user?.provider ? <Navigate to="/provider/dashboard" /> : <Navigate to="/map" />;
    }

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, kycRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/kyc-pending')
            ]);
            setStats(statsRes.data);
            setPendingKyc(kycRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            showToast('Failed to load admin dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKycAction = async (providerId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await api.post(`/admin/kyc/${providerId}`, { status });
            showToast(`Provider ${status.toLowerCase()} successfully`, 'success');
            // Refresh list
            setPendingKyc(prev => prev.filter(p => p.id !== providerId));
        } catch (error) {
            console.error('Failed to update KYC:', error);
            showToast('Failed to update verification status', 'error');
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Admin Dashboard...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(108, 92, 231, 0.2)', borderRadius: '12px', color: '#6c5ce7' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ color: '#a0a0b0', fontSize: '14px' }}>Total Users</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats?.totalUsers || 0}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(0, 206, 201, 0.2)', borderRadius: '12px', color: '#00cec9' }}>
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <div style={{ color: '#a0a0b0', fontSize: '14px' }}>Total Providers</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats?.totalProviders || 0}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(253, 203, 110, 0.2)', borderRadius: '12px', color: '#fdcb6e' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ color: '#a0a0b0', fontSize: '14px' }}>Completed Jobs</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats?.totalJobs || 0}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(46, 204, 113, 0.2)', borderRadius: '12px', color: '#2ecc71' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div style={{ color: '#a0a0b0', fontSize: '14px' }}>Platform Revenue</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{Number(stats?.platformRevenue || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* KYC Pending Section */}
            <div className="glass-card" style={{ padding: '25px', borderRadius: '15px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Pending KYC Approvals</h2>
                
                {pendingKyc.length === 0 ? (
                    <div style={{ color: '#a0a0b0', padding: '20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                        No pending verifications at the moment.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '10px' }}>Provider Name</th>
                                    <th style={{ padding: '10px' }}>Email</th>
                                    <th style={{ padding: '10px' }}>Document URL</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingKyc.map((provider) => (
                                    <tr key={provider.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '10px' }}>{provider.user?.fullName || 'N/A'}</td>
                                        <td style={{ padding: '10px', color: '#a0a0b0' }}>{provider.user?.email || 'N/A'}</td>
                                        <td style={{ padding: '10px' }}>
                                            <a href={provider.aadhaarCardUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6c5ce7', textDecoration: 'none' }}>
                                                View Document
                                            </a>
                                        </td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => handleKycAction(provider.id, 'VERIFIED')}
                                                style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleKycAction(provider.id, 'REJECTED')}
                                                style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
