import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const AccountPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                console.log('Bookings API Response:', res.data);
                setBookings(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
                showToast("Failed to load your bookings", "error");
                setBookings([]);
            }
        };
        fetchBookings();
    }, []);

    if (!user) return <div style={{ padding: '20px' }}>Please login</div>;

    return (
        <div className="account-container" style={{
            minHeight: '100vh',
            background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gwalior_Fort_View.jpg/1200px-Gwalior_Fort_View.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '20px',
            color: 'white'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginRight: '10px' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>My Account</h1>
                </div>

                {/* Profile Card */}
                <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                        {user.fullName ? user.fullName[0] : user.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{user.fullName || 'User'}</h2>
                        <p style={{ color: '#a0a0b0', margin: '5px 0' }}>{user.email}</p>
                        <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'transparent', border: '1px solid #ff7675', color: '#ff7675', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Bookings List */}
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>My Bookings</h3>

                {bookings.length === 0 ? (
                    <p style={{ color: '#a0a0b0', textAlign: 'center' }}>No bookings yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {bookings.map((booking: any) => (
                            <div key={booking.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize' }}>{booking.serviceType}</h4>
                                    <div style={{ display: 'flex', gap: '15px', color: '#a0a0b0', fontSize: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(booking.createdAt).toLocaleDateString()}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(booking.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                                        <MapPin size={12} color="#00cec9" /> {Number(booking.locationLat || 0).toFixed(4)}, {Number(booking.locationLng || 0).toFixed(4)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#00cec9' }}>₹{booking.priceEstimated}</div>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        background: booking.status === 'COMPLETED' ? 'rgba(0,206,201,0.2)' : 'rgba(253,203,110,0.2)',
                                        color: booking.status === 'COMPLETED' ? '#00cec9' : '#fdcb6e'
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPage;
