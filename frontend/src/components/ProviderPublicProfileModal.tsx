import React from 'react';
import { User, Star, MapPin, X, Shield } from 'lucide-react';

interface ProviderPublicProfileModalProps {
    provider: any;
    onClose: () => void;
    onBook: () => void;
}

const ProviderPublicProfileModal: React.FC<ProviderPublicProfileModalProps> = ({ provider, onClose, onBook }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 3000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '0', overflow: 'hidden', position: 'relative' }}>
                {/* Header Image / Pattern */}
                <div style={{ height: '100px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: '5px' }} onClick={onClose}>
                        <X color="white" size={20} />
                    </div>
                </div>

                {/* Profile Info */}
                <div style={{ padding: '0 20px 20px', marginTop: '-40px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#2d3436', border: '4px solid #1e1e2f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', color: 'white'
                    }}>
                        {provider.name ? provider.name.charAt(0) : <User />}
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <h2 style={{ margin: 0 }}>{provider.name || 'Professional'}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fdcb6e', marginTop: '5px' }}>
                            <Star size={16} fill="#fdcb6e" />
                            <span style={{ fontWeight: 'bold' }}>4.8</span>
                            <span style={{ color: '#a0a0b0', fontSize: '12px' }}>(120 Reviews)</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                        <div style={{ padding: '4px 10px', background: 'rgba(108, 92, 231, 0.2)', color: '#a29bfe', borderRadius: '15px', fontSize: '12px' }}>
                            {provider.serviceType || 'Service Pro'}
                        </div>
                        <div style={{ padding: '4px 10px', background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Shield size={10} /> Verified
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '15px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>250+</div>
                            <div style={{ color: '#a0a0b0', fontSize: '12px' }}>Jobs Done</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>5 Years</div>
                            <div style={{ color: '#a0a0b0', fontSize: '12px' }}>Experience</div>
                        </div>
                    </div>

                    {/* Location */}
                    <div style={{ padding: '15px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#a0a0b0', fontSize: '14px' }}>
                        <MapPin size={16} />
                        <span>Available in Gwalior Area</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={onBook}>Book Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderPublicProfileModal;
