import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Briefcase, User, Calendar, DollarSign, MapPin } from 'lucide-react';
import api from '../utils/api';

const ProviderDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);

    // Location Tracking Logic
    useEffect(() => {
        if (!socket) return;
        let watchId: number | null = null;

        // Track ALL active accepted/in-progress bookings
        const activeBookings = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');

        if (activeBookings.length > 0) {
            console.log('Starting Location Tracking for Bookings:', activeBookings.map(b => b.id));
            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        // Emit update for EACH active booking
                        activeBookings.forEach(booking => {
                            socket.emit('updateLocation', {
                                bookingId: booking.id,
                                lat: latitude,
                                lng: longitude
                            });
                        });
                        console.log('Location sent for bookings:', activeBookings.length, latitude, longitude);
                    },
                    (err) => console.error('Location Watch Error:', err),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [socket, bookings]); // Re-run when job list/status changes

    useEffect(() => {
        // Fetch existing bookings
        api.get('/bookings/provider/requests')
            .then(res => {
                setBookings(res.data);
            })
            .catch(err => console.error('Failed to fetch bookings', err));

        if (!socket) return;

        // Listen for new booking requests
        socket.on('booking.new', (data: any) => {
            console.log('New Booking:', data);
            showToast(`New Job Opportunity: ${data.serviceType}`, 'success');
            setBookings(prev => [data, ...prev]);
        });

        return () => {
            socket.off('booking.new');
        };
    }, [socket, showToast]);

    const handleStatusUpdate = async (bookingId: string, status: 'ACCEPTED' | 'CANCELLED') => {
        try {
            await api.post(`/bookings/${bookingId}/status`, { status });
            showToast(`Booking ${status.toLowerCase()} successfully`, 'success');
            // Update local state to reflect the new status
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status } : b
            ));
        } catch (err) {
            console.error('Failed to update status', err);
            showToast('Failed to update status', 'error');
        }
    };

    return (
        <div className="app-container" style={{ paddingBottom: '80px', background: 'var(--color-bg-primary)' }}>
            {/* Header */}
            <div style={{
                padding: '30px 20px',
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                borderBottomLeftRadius: '30px',
                borderBottomRightRadius: '30px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(108, 92, 231, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '24px' }}>Dashboard</h1>
                        <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.8)' }}>Welcome back, {user?.fullName?.split(' ')[0] || 'Partner'}!</p>
                    </div>
                    <div onClick={() => navigate('/provider/profile')} style={{
                        width: '40px', height: '40px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <User size={20} color="white" />
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                    <div className="glass-card" style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.15)', border: 'none' }}>
                        <div style={{ opacity: 0.8, fontSize: '12px', color: 'white' }}>Earnings</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>₹0</div>
                    </div>
                    <div className="glass-card" style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.15)', border: 'none' }}>
                        <div style={{ opacity: 0.8, fontSize: '12px', color: 'white' }}>Jobs</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{bookings.length}</div>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div style={{ padding: '0 20px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--color-text-primary)' }}>Active Jobs</h3>

                {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5 }}>
                        <Briefcase size={48} style={{ marginBottom: '15px', color: 'var(--color-text-secondary)' }} />
                        <p>No active jobs right now.<br />Wait for customers to request your services.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {bookings.map((booking, idx) => (
                            <div key={idx} className="glass-card" style={{ padding: '15px', borderLeft: '4px solid var(--color-accent)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0 }}>{booking.serviceType || 'Service Request'}</h4>
                                    <span style={{
                                        fontSize: '12px',
                                        background: booking.status === 'ACCEPTED' ? 'rgba(0, 206, 201, 0.2)' : 'rgba(108, 92, 231, 0.2)',
                                        color: booking.status === 'ACCEPTED' ? '#00cec9' : '#a29bfe',
                                        padding: '4px 8px', borderRadius: '4px'
                                    }}>
                                        {booking.status || 'New'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                                    <Briefcase size={14} />
                                    <span>Service: <strong>{booking.serviceType || 'General'}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                                    <User size={14} />
                                    <span style={{ color: 'white' }}>{booking.customer ? booking.customer.fullName : 'Customer'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                                    <MapPin size={14} />
                                    <span>{booking.locationGeo ? `${booking.locationLat}, ${booking.locationLng}` : 'Location provided'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                                    <Calendar size={14} />
                                    <span>{new Date(booking.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    <DollarSign size={14} />
                                    <span>Est. Price: {booking.price || '500'}</span>
                                </div>

                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    {booking.status === 'ACCEPTED' ? (
                                        <button
                                            className="btn-primary"
                                            style={{ flex: 1, fontSize: '14px', padding: '8px', background: '#00cec9', cursor: 'default' }}
                                        >
                                            In Progress (Sharing Location)
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                style={{ flex: 1, fontSize: '14px', padding: '8px' }}
                                                onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                                            >
                                                Accept
                                            </button>
                                            <button style={{
                                                flex: 1, padding: '8px', border: '1px solid rgba(255,50,50,0.5)',
                                                background: 'transparent', color: '#ff6b6b', borderRadius: '8px',
                                                fontSize: '14px', cursor: 'pointer'
                                            }}
                                                onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Provider Bottom Nav */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#13131f', borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'space-around', padding: '15px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-accent)', cursor: 'pointer' }}>
                    <Briefcase size={20} />
                    <span style={{ fontSize: '10px', marginTop: '4px' }}>Jobs</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a0a0b0', cursor: 'pointer' }}>
                    <Calendar size={20} />
                    <span style={{ fontSize: '10px', marginTop: '4px' }}>Schedule</span>
                </div>
                <div
                    onClick={() => navigate('/provider/profile')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a0a0b0', cursor: 'pointer' }}
                >
                    <User size={20} />
                    <span style={{ fontSize: '10px', marginTop: '4px' }}>Profile</span>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboardPage;
