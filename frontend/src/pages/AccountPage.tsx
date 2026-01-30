import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const AccountPage: React.FC = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<any[]>([]);
    const [address, setAddress] = useState(user?.address || '');
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    const handleUpdateAddress = async () => {
        try {
            const res = await api.patch('/users/profile', { address });
            // Update local user context is tricky without a full reload or complex reducer, 
            // but we can just update the object for now if login() supports it, 
            // OR just rely on the component state for immediate feedback.
            // Ideally: updateAuthUser({ ...user, address });
            // For now, let's just update the local storage/state hackily or re-fetch profile.
            // Simplified: we will just assume success and update local state to show it.
            // To make it persist in context:
            const updatedUser = { ...user, address };
            login(localStorage.getItem('accessToken') || '', updatedUser);

            setIsEditingAddress(false);
            showToast('Address updated successfully', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to update address', 'error');
        }
    };

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
                    <h2 style={{ margin: 0 }}>{user.fullName || 'User'}</h2>
                    <p style={{ color: '#a0a0b0', margin: '5px 0' }}>{user.email}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <MapPin size={16} color="#a0a0b0" />
                        {isEditingAddress ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="input-field"
                                    style={{ padding: '4px 8px', fontSize: '12px', width: '200px' }}
                                    placeholder="Enter your address"
                                />
                                <button onClick={handleUpdateAddress} className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }}>Save</button>
                            </div>
                        ) : (
                            <span style={{ color: '#dfe6e9', fontSize: '14px' }}>
                                {address || 'Location not set'}
                            </span>
                        )}
                        {!isEditingAddress && (
                            <button onClick={() => setIsEditingAddress(true)} style={{ background: 'transparent', border: 'none', color: '#00cec9', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                                Edit
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'transparent', border: '1px solid #ff7675', color: '#ff7675', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>My Bookings</h3>

            {bookings.length === 0 ? (
                <p style={{ color: '#a0a0b0', textAlign: 'center' }}>No bookings yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {bookings.map((booking: any) => (
                        <div key={booking.id}>
                            <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            {/* Provider Details Section */}
                            {
                                booking.status === 'ACCEPTED' && booking.provider && (
                                    <div className="glass-card" style={{ marginTop: '10px', padding: '15px', background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', color: 'white'
                                            }}>
                                                {booking.provider.user?.fullName?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '14px', color: 'white' }}>{booking.provider.user?.fullName || 'Provider Assigned'}</h5>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a0a0b0' }}>
                                                    Has accepted your request. They will arrive shortly.
                                                </p>
                                            </div>
                                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>Call</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
};

export default AccountPage;
