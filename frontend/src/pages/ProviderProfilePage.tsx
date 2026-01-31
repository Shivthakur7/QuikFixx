import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogOut, Settings, Award, MapPin, Star as RatingSizeStar } from 'lucide-react';
import api from '../utils/api';
import EditProfileModal from '../components/EditProfileModal';

const ProviderProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login/provider');
    };

    const [reviews, setReviews] = useState<any[]>([]);
    const [showReviews, setShowReviews] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

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
                    {user?.fullName?.charAt(0) || 'P'}
                </div>
                <h3 style={{ margin: '0 0 5px 0' }}>{user?.fullName}</h3>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{user?.email}</p>
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
                    <span>{user?.address || 'Operational Area: Gwalior'}</span>
                </div>

                {/* Services Section */}
                <div style={{ marginTop: '20px', width: '100%' }}>
                    <h4 style={{ color: '#a0a0b0', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>My Services</h4>
                    {user?.provider?.skillTags && user.provider.skillTags.length > 0 ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {user.provider.skillTags.map((skill: string, index: number) => (
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
                    currentUser={user}
                    onClose={() => setIsEditing(false)}
                    onSuccess={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

export default ProviderProfilePage;
