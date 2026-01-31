import React from 'react';
import { User, Star, MapPin, X, Shield } from 'lucide-react';

interface ProviderPublicProfileModalProps {
    provider: any;
    onClose: () => void;
    onBook: () => void;
}

const ProviderPublicProfileModal: React.FC<ProviderPublicProfileModalProps> = ({ provider, onClose, onBook }) => {
    const stats = provider.stats || { jobsDone: 0, reviewCount: 0, experience: 'New' };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 3000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(8px)'
        }}>
            <div className="glass-card" style={{
                width: '90%', maxWidth: '380px', padding: '0', overflow: 'hidden', position: 'relative',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
                {/* Header Image / Pattern */}
                <div style={{ height: '110px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', position: 'relative' }}>
                    <div
                        style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', padding: '6px', transition: 'background 0.2s' }}
                        onClick={onClose}
                    >
                        <X color="white" size={18} />
                    </div>
                </div>

                {/* Profile Info */}
                <div style={{ padding: '0 25px 25px', marginTop: '-45px', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '50%',
                        background: '#2d3436', border: '4px solid #1e1e2f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', color: 'white',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}>
                        {provider.name ? provider.name.charAt(0) : <User size={40} />}
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{provider.name || 'Professional'}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fdcb6e' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <Star size={16} fill="#fdcb6e" />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                {provider.rating ? Number(provider.rating).toFixed(1) : 'New'}
                            </span>
                            <span style={{ color: '#a0a0b0', fontSize: '13px' }}>
                                ({stats.reviewCount} Reviews)
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
                        <div style={{
                            padding: '6px 12px', background: 'rgba(108, 92, 231, 0.15)',
                            color: '#a29bfe', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                            border: '1px solid rgba(108, 92, 231, 0.3)'
                        }}>
                            {provider.serviceType || 'General'}
                        </div>
                        <div style={{
                            padding: '6px 12px', background: 'rgba(46, 204, 113, 0.15)',
                            color: '#2ecc71', borderRadius: '20px', fontSize: '12px',
                            display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500',
                            border: '1px solid rgba(46, 204, 113, 0.3)'
                        }}>
                            <Shield size={12} fill="#2ecc71" /> Verified Partner
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginTop: '10px'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'white' }}>{stats.jobsDone}+</div>
                            <div style={{ color: '#a0a0b0', fontSize: '12px', marginTop: '4px' }}>Jobs Done</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'white' }}>{stats.experience}</div>
                            <div style={{ color: '#a0a0b0', fontSize: '12px', marginTop: '4px' }}>Member Since</div>
                        </div>
                    </div>

                    {/* Location */}
                    <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#a0a0b0', fontSize: '14px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={16} color="#a0a0b0" />
                        </div>
                        <span>Available in Gwalior Area</span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '5px' }}>
                        <button
                            className="btn-primary"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px',
                                fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                            }}
                            onClick={onBook}
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderPublicProfileModal;
