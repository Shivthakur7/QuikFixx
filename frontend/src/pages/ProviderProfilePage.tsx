import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, LogOut, Settings, Award, MapPin, Star as RatingSizeStar, Upload, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import EditProfileModal from '../components/EditProfileModal';

const ProviderProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Local state to force refresh or store updated user if context is stale
    const [localProviderData, setLocalProviderData] = useState<any>(null);

    const activeUser = localProviderData || user;

    const refreshProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setLocalProviderData(res.data);
            // Optionally update context: login(localStorage.getItem('accessToken') || '', res.data);
        } catch (err) {
            console.error('Failed to refresh profile', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login/provider');
    };

    const [reviews, setReviews] = useState<any[]>([]);
    const [showReviews, setShowReviews] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/providers/upload-verification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast('Document uploaded! Verification is now PENDING.', 'success');
            await refreshProfile(); // Refresh data to show PENDING status
        } catch (error) {
            console.error('Upload failed', error);
            showToast('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Initial Refresh
    React.useEffect(() => {
        refreshProfile();
    }, []);

    // Fetch Reviews
    React.useEffect(() => {
        if (user?.provider?.id) {
            api.get(`/reviews/provider/${user.provider.id}`)
                .then(res => {
                    setReviews(res.data);
                    // Calculate local average if needed, or rely on provider.rating from DB
                    if (res.data.length > 0) {
                        const total = res.data.reduce((acc: number, r: any) => acc + r.rating, 0);
                        setAverageRating(total / res.data.length);
                    }
                })
                .catch(err => console.error('Failed to fetch reviews', err));
        }
    }, [user]);

    return (
        <div className="app-container" style={{ paddingBottom: '20px' }}>
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
                    {activeUser?.fullName?.charAt(0) || 'P'}
                </div>
                <h3 style={{ margin: '0 0 5px 0' }}>{activeUser?.fullName}</h3>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{activeUser?.email}</p>
                <div style={{ marginTop: '10px', padding: '5px 12px', background: 'rgba(108, 92, 231, 0.2)', borderRadius: '20px', color: '#a29bfe', fontSize: '12px' }}>
                    Verified Partner
                </div>

                {/* Star Rating Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                    <RatingSizeStar size={16} fill="#fdcb6e" color="#fdcb6e" />
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
                    <span style={{ color: '#a0a0b0', fontSize: '12px' }}>({reviews.length} reviews)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a0a0b0', fontSize: '14px', marginTop: '10px' }}>
                    <MapPin size={14} />
                    <span>{activeUser?.provider?.address || activeUser?.address || 'Operational Area: Gwalior'}</span>
                </div>

                {/* Address Update Section */}
                <div style={{ width: '100%', marginTop: '15px' }}>
                    <div className="glass-card" style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', color: '#dfe6e9' }}>Service Location</h4>
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        showToast('Detecting location...', 'info');
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                const lat = pos.coords.latitude;
                                                const lng = pos.coords.longitude;

                                                // Reverse Geocode
                                                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                                                    .then(res => res.json())
                                                    .then(async (data) => {
                                                        const address = data.display_name;
                                                        try {
                                                            await api.patch('/providers/location', {
                                                                lat,
                                                                lng,
                                                                address
                                                            });
                                                            showToast('Location updated to current position!', 'success');
                                                            window.location.reload();
                                                        } catch (err) {
                                                            console.error(err);
                                                            showToast('Failed to update location', 'error');
                                                        }
                                                    })
                                                    .catch(err => {
                                                        console.error(err);
                                                        showToast('Address fetch failed', 'error');
                                                    });
                                            },
                                            (err) => {
                                                console.error(err);
                                                showToast('Location access denied', 'error');
                                            }
                                        );
                                    } else {
                                        showToast('Geolocation not supported', 'error');
                                    }
                                }}
                                style={{
                                    background: 'rgba(108, 92, 231, 0.2)',
                                    color: '#a29bfe',
                                    border: '1px solid rgba(108, 92, 231, 0.4)',
                                    padding: '5px 10px',
                                    borderRadius: '15px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <MapPin size={10} /> Use Current Location
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Update your base location..."
                                className="input-field"
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length > 2) {
                                        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}&limit=5&addressdetails=1&countrycodes=in`)
                                            .then(res => res.json())
                                            .then(data => {
                                                // We need a way to show suggestions. 
                                                // For simplicity, let's use a quick local state if I can inject it, 
                                                // or just alert the user to select from list.
                                                // Better: use a datalist or similar?
                                                // Since I cannot easily add complex state without full rewrite, 
                                                // I'll try to insert a suggestions box ID if possible or just use a simple list below.
                                                const list = document.getElementById('addr-suggestions');
                                                if (list) {
                                                    list.innerHTML = '';
                                                    data.forEach((s: any) => {
                                                        const item = document.createElement('div');
                                                        item.style.padding = '8px';
                                                        item.style.borderBottom = '1px solid #333';
                                                        item.style.cursor = 'pointer';
                                                        item.innerText = s.display_name;
                                                        item.onclick = async () => {
                                                            // Update via API
                                                            try {
                                                                await api.patch('/providers/location', {
                                                                    lat: parseFloat(s.lat),
                                                                    lng: parseFloat(s.lon),
                                                                    address: s.display_name
                                                                });
                                                                showToast('Location updated successfully!', 'success');
                                                                window.location.reload();
                                                            } catch (err) {
                                                                console.error(err);
                                                                showToast('Failed to update location', 'error');
                                                            }
                                                        };
                                                        list.appendChild(item);
                                                    });
                                                }
                                            });
                                    }
                                }}
                            />
                            <div id="addr-suggestions" style={{ maxHeight: '150px', overflowY: 'auto', background: '#2d3436', marginTop: '5px', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div style={{ marginTop: '20px', width: '100%' }}>
                    <h4 style={{ color: '#a0a0b0', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>My Services</h4>
                    {activeUser?.provider?.skillTags && activeUser.provider.skillTags.length > 0 ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {activeUser.provider.skillTags.map((skill: string, index: number) => (
                                <div key={index} style={{
                                    padding: '8px 16px',
                                    background: 'rgba(108, 92, 231, 0.15)',
                                    border: '1px solid rgba(108, 92, 231, 0.3)',
                                    borderRadius: '20px',
                                    color: '#a29bfe',
                                    fontSize: '14px',
                                    textTransform: 'capitalize',
                                    letterSpacing: '0.5px'
                                }}>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#636e72', fontSize: '14px' }}>No services listed yet.</p>
                    )}
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <div
                    onClick={() => setIsEditing(true)}
                    className="glass-card"
                    style={{ display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '15px', cursor: 'pointer' }}
                >
                    <Settings size={20} style={{ marginRight: '15px', color: '#a0a0b0' }} />
                    <span style={{ flex: 1 }}>Account Settings</span>
                </div>

                {/* Verification Card */}
                <div className="glass-card" style={{ marginBottom: '15px', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <ShieldAlert size={20} style={{ marginRight: '15px', color: '#a0a0b0' }} />
                        <span style={{ flex: 1 }}>Identity Verification</span>
                        {/* Dynamic Status Badge */}
                        {activeUser?.provider?.verificationStatus === 'APPROVED' ? (
                            <span style={{ fontSize: '12px', color: '#00b894', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Verified</span>
                        ) : activeUser?.provider?.verificationStatus === 'PENDING' ? (
                            <span style={{ fontSize: '12px', color: '#fdcb6e' }}>Pending Review</span>
                        ) : (
                            <span style={{ fontSize: '12px', color: '#ff7675' }}>Not Verified</span>
                        )}
                    </div>

                    {activeUser?.provider?.verificationStatus !== 'APPROVED' && activeUser?.provider?.verificationStatus !== 'PENDING' && (
                        <div>
                            <p style={{ fontSize: '12px', color: '#a0a0b0', marginBottom: '10px' }}>Upload your Aadhaar Card to get the "Verified" badge and 3x more bookings.</p>
                            <label style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                background: uploading ? 'rgba(255,255,255,0.1)' : 'rgba(108, 92, 231, 0.2)',
                                color: uploading ? '#b2bec3' : '#a29bfe',
                                padding: '10px', borderRadius: '8px', cursor: uploading ? 'default' : 'pointer',
                                border: '1px dashed rgba(108, 92, 231, 0.4)'
                            }}>
                                <Upload size={16} />
                                {uploading ? 'Uploading...' : 'Upload Document'}
                                <input type="file" onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} disabled={uploading} />
                            </label>
                        </div>
                    )}

                    {activeUser?.provider?.verificationStatus === 'PENDING' && (
                        <div style={{ background: 'rgba(253, 203, 110, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#fdcb6e', border: '1px solid rgba(253, 203, 110, 0.2)' }}>
                            Your document is under review. This usually takes 24 hours.
                        </div>
                    )}
                </div>

                {/* Expandable Reviews Section */}
                <div className="glass-card" style={{ marginBottom: '15px', overflow: 'hidden' }}>
                    <div
                        onClick={() => setShowReviews(!showReviews)}
                        style={{ display: 'flex', alignItems: 'center', padding: '15px', cursor: 'pointer' }}
                    >
                        <Award size={20} style={{ marginRight: '15px', color: '#a0a0b0' }} />
                        <span style={{ flex: 1 }}>Reviews & Ratings</span>
                        <span style={{ color: '#a0a0b0', fontSize: '12px' }}>{showReviews ? 'Hide' : 'Show'}</span>
                    </div>

                    {showReviews && (
                        <div style={{ padding: '0 15px 15px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {reviews.length === 0 ? (
                                <p style={{ color: '#636e72', fontSize: '12px', textAlign: 'center', padding: '10px' }}>No reviews yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                    {reviews.map((review) => (
                                        <div key={review.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{review.customer?.fullName || 'Customer'}</span>
                                                    <div style={{ display: 'flex' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <RatingSizeStar key={i} size={10} fill={i < review.rating ? '#fdcb6e' : 'none'} color={i < review.rating ? '#fdcb6e' : '#636e72'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '10px', color: '#636e72' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {review.comment && (
                                                <p style={{ margin: 0, fontSize: '13px', color: '#dfe6e9', fontStyle: 'italic' }}>"{review.comment}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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

            {isEditing && (
                <EditProfileModal
                    currentUser={activeUser}
                    onClose={() => setIsEditing(false)}
                    onSuccess={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

export default ProviderProfilePage;
